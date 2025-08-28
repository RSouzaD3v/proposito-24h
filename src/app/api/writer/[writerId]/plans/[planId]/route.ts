import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { assertWriterAdmin } from "@/lib/authz";

export const runtime = "nodejs";

/**
 * PUT: altera valores do plano -> cria novo price e inativa o antigo
 * body: { amountCents?, currency?, interval?, trialDays?, applicationFeePct? }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ writerId: string; planId: string }> }
) {
  const { writerId, planId } = await params;
  await assertWriterAdmin(writerId);

  const body = await req.json();
  const { amountCents, currency, interval, trialDays, applicationFeePct } = body;

  const plan = await db.writerSubscriptionPlan.findFirst({
    where: { id: planId, writerId },
  });
  if (!plan) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });

  // cria novo price se amount/currency/interval mudarem
  let newStripePriceId = plan.stripePriceId;

  const willChangePrice =
    (typeof amountCents === "number" && amountCents !== plan.amountCents) ||
    (typeof currency === "string" && currency.toUpperCase() !== plan.currency) ||
    (typeof interval === "string" && interval !== plan.interval);

  if (willChangePrice) {
    // inativa price antigo
    await stripe.prices.update(plan.stripePriceId, { active: false });

    // cria novo price
    const price = await stripe.prices.create({
      unit_amount: typeof amountCents === "number" ? amountCents : plan.amountCents,
      currency: (currency ?? plan.currency).toLowerCase(),
      recurring: { interval: (interval ?? plan.interval).toLowerCase() as any },
      product: plan.stripeProductId,
      metadata: { writerId },
    });
    newStripePriceId = price.id;
  }

  const updated = await db.writerSubscriptionPlan.update({
    where: { id: planId },
    data: {
      stripePriceId: newStripePriceId,
      amountCents: typeof amountCents === "number" ? amountCents : plan.amountCents,
      currency: (currency ?? plan.currency).toUpperCase(),
      interval: (interval ?? plan.interval),
      trialDays: typeof trialDays === "number" ? trialDays : plan.trialDays,
      applicationFeePct:
        typeof applicationFeePct === "number" ? applicationFeePct : plan.applicationFeePct,
    },
  });

  return NextResponse.json(updated);
}

/**
 * PATCH: ativa/desativa plano
 * body: { isActive: boolean }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ writerId: string; planId: string }> }
) {
  const { writerId, planId } = await params;
  await assertWriterAdmin(writerId);

  const { isActive } = await req.json();
  const updated = await db.writerSubscriptionPlan.update({
    where: { id: planId },
    data: { isActive: !!isActive },
  });
  return NextResponse.json(updated);
}
