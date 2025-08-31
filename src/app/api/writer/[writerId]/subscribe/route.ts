import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export const runtime = "nodejs";

// function absoluteUrl(path: string) {
//   const base = process.env.APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
//   return `${base}${path.startsWith("/") ? path : `/${path}`}`;
// }

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ writerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userReader = await db.user.findUnique({
    where: { id: session?.user.id },
    select: {
      writer: {
        select: {
          slug: true
        }
      }
    }
  });

  if (!userReader) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const userId = session.user.id;
  const { writerId } = await params;
  const { planId, successUrl, cancelUrl } = await req.json();

  // 1) Escritor + plano
  const writer = await db.writer.findUnique({ where: { id: writerId } });
  if (!writer?.stripeAccountId) {
    return NextResponse.json({ error: "Escritor sem Stripe Connect" }, { status: 400 });
  }

  const plan = await db.writerSubscriptionPlan.findFirst({
    where: { writerId, id: planId ?? undefined, isActive: true },
    orderBy: [{ amountCents: "asc" }],
  });
  if (!plan?.stripePriceId) {
    return NextResponse.json({ error: "Plano não encontrado/ativo" }, { status: 404 });
  }

  // 2) Garante Customer do leitor na PLATAFORMA
  const user = await db.user.findUnique({ where: { id: userId } });
  let stripeCustomerId = user?.stripeCustomerId ?? null;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user?.email ?? undefined,
      name: user?.name ?? undefined,
      metadata: { appUserId: userId },
    });
    stripeCustomerId = customer.id;
    await db.user.update({
      where: { id: userId },
      data: { stripeCustomerId },
    });
  }

  // 3) Upsert da assinatura local (INCOMPLETE)
  const readerSub = await db.readerSubscription.upsert({
    where: { reader_writer_unique: { readerId: userId, writerId } },
    update: {
      priceId: plan.stripePriceId,
      status: "INCOMPLETE",
    },
    create: {
      readerId: userId,
      writerId,
      stripeCustomerId,
      priceId: plan.stripePriceId,
      status: "INCOMPLETE",
      metadata: {},
    },
  });

  const APP_URL = process.env.BASE_URL || "http://localhost:3000";

  const URL_WITH_SUBDOMAIN = new URL(APP_URL);
  const userSlug = userReader.writer?.slug;
  if (userSlug) {
    const hostnameParts = URL_WITH_SUBDOMAIN.hostname.split(".");
    if (hostnameParts[0] === "www") {
      hostnameParts.shift(); // Remove "www"
    }
    URL_WITH_SUBDOMAIN.hostname = `${userSlug}.${hostnameParts.join(".")}`;
  }

  // 4) Checkout de assinatura com destination charges
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId!,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${URL_WITH_SUBDOMAIN}/reader/area/`,
    cancel_url: `${URL_WITH_SUBDOMAIN}/reader/area/w/${writer.slug}`,
    allow_promotion_codes: true,
    subscription_data: {
      transfer_data: { destination: writer.stripeAccountId! },
      ...(plan.applicationFeePct
        ? { application_fee_percent: plan.applicationFeePct }
        : {}),
      metadata: {
        kind: "reader_to_writer_subscription",
        writerId,
        readerId: userId,
        readerSubscriptionId: readerSub.id,
      },
      ...(plan.trialDays ? { trial_period_days: plan.trialDays } : {}),
    //   payment_settings: { save_default_payment_method: "on_subscription" },
    },
    // redundância de identificação na session
    metadata: {
      kind: "reader_to_writer_subscription",
      writerId,
      readerId: userId,
      readerSubscriptionId: readerSub.id,
    },
  });

  return NextResponse.json({ url: checkout.url });
}
