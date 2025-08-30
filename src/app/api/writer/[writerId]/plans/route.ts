import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { assertWriterAdmin } from "@/lib/authz";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ writerId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { writerId } = await params;

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { writerId: true, role: true },
  });

  if (user?.role === 'WRITER_ADMIN') {
    const plans = await db.writerSubscriptionPlan.findMany({
      where: { writerId },
      orderBy: [{ isActive: "desc" }, { amountCents: "asc" }],
      select: {
        id: true, stripeProductId: true, stripePriceId: true, interval: true,
        amountCents: true, currency: true, trialDays: true,
        applicationFeePct: true, isActive: true, createdAt: true,
        isReaderVisible: true
      },
    });

    return NextResponse.json(plans);
  }



  const plans = await db.writerSubscriptionPlan.findMany({
    where: { writerId, isActive: true, isReaderVisible: true },
    orderBy: [{ amountCents: "asc" }],
    select: {
      id: true, stripeProductId: true, stripePriceId: true, interval: true,
      amountCents: true, currency: true, trialDays: true,
      applicationFeePct: true, isActive: true, createdAt: true,
      isReaderVisible: true
    },
  });

  return NextResponse.json(plans);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ writerId: string }> }
) {
  const { writerId } = await params;
  try {
    await assertWriterAdmin(writerId);

    const body = await req.json();
    const {
      name,
      amountCents,
      currency = "BRL",
      interval = "MONTH", // "DAY" | "WEEK" | "MONTH" | "YEAR" | "LIFETIME"
      trialDays = 0,
      applicationFeePct = null as number | null,
      isReaderVisible = true,
    } = body;

    if (!Number.isInteger(amountCents) || amountCents < 100) {
      return NextResponse.json({ error: "amountCents inválido (>=100)" }, { status: 400 });
    }

    const writer = await db.writer.findUnique({ where: { id: writerId } });
    if (!writer?.stripeAccountId) {
      return NextResponse.json({ error: "Escritor sem Stripe Connect" }, { status: 400 });
    }

    const isLifetime = interval === "LIFETIME";
    if (isLifetime && trialDays > 0) {
      return NextResponse.json({ error: "trialDays não é permitido para LIFETIME" }, { status: 400 });
    }

    // 1) Product na CONTA MASTER
    const product = await stripe.products.create({
      name: name || (isLifetime
        ? `Acesso Vitalício – ${writer.name}`
        : `Assinatura ${interval} – ${writer.name}`),
      metadata: { writerId, interval },
    });

    // 2) Price:
    //    - Recorrente para DAY/WEEK/MONTH/YEAR
    //    - Único (sem recurring) para LIFETIME
    let price;
    if (isLifetime) {
      price = await stripe.prices.create({
        unit_amount: amountCents,
        currency: currency.toLowerCase(),
        product: product.id,
        metadata: { writerId, interval: "LIFETIME" },
      });
    } else {
      // interval em minúsculas: 'day' | 'week' | 'month' | 'year'
      const stripeInterval = interval.toLowerCase() as "day" | "week" | "month" | "year";
      price = await stripe.prices.create({
        unit_amount: amountCents,
        currency: currency.toLowerCase(),
        recurring: { interval: stripeInterval },
        product: product.id,
        metadata: { writerId, interval },
      });
    }

    // 3) Plano no DB
    const plan = await db.writerSubscriptionPlan.create({
      data: {
        writerId,
        stripeProductId: product.id,
        stripePriceId: price.id,
        interval, // mantém "LIFETIME" no banco para sua lógica de acesso
        amountCents,
        currency: currency.toUpperCase(),
        trialDays: isLifetime ? 0 : trialDays,
        applicationFeePct: applicationFeePct ?? undefined,
        isActive: true,
        isReaderVisible,
      },
    });

    return NextResponse.json(plan);
  } catch (e: any) {
    const msg = e?.message || "Erro ao criar plano";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
