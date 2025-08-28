import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { assertWriterAdmin } from "@/lib/authz";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ writerId: string }> }
) {
  const { writerId } = await params;

  const plans = await db.writerSubscriptionPlan.findMany({
    where: { writerId },
    orderBy: [{ isActive: "desc" }, { amountCents: "asc" }],
    select: {
      id: true, stripeProductId: true, stripePriceId: true, interval: true,
      amountCents: true, currency: true, trialDays: true,
      applicationFeePct: true, isActive: true, createdAt: true,
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
      name, // opcional p/ o Product: ex. "Assinatura Mensal do Autor X"
      amountCents,
      currency = "BRL",
      interval = "MONTH", // "DAY" | "WEEK" | "MONTH" | "YEAR"
      trialDays = 0,
      applicationFeePct = null as number | null,
    } = body;

    if (!Number.isInteger(amountCents) || amountCents < 100) {
      return NextResponse.json({ error: "amountCents inválido (>=100)" }, { status: 400 });
    }

    // Confere se escritor tem Connect
    const writer = await db.writer.findUnique({ where: { id: writerId } });
    if (!writer?.stripeAccountId) {
      return NextResponse.json({ error: "Escritor sem Stripe Connect" }, { status: 400 });
    }

    // 1) Product na CONTA MASTER
    const product = await stripe.products.create({
      name: name || `Assinatura ${interval} – ${writer.name}`,
      metadata: { writerId },
    });

    // 2) Price recorrente
    const price = await stripe.prices.create({
      unit_amount: amountCents,
      currency: currency.toLowerCase(),
      recurring: { interval: interval.toLowerCase() as any }, // month/week/day/year
      product: product.id,
      metadata: { writerId },
    });

    // 3) Plano no DB
    const plan = await db.writerSubscriptionPlan.create({
      data: {
        writerId,
        stripeProductId: product.id,
        stripePriceId: price.id,
        interval,
        amountCents,
        currency: currency.toUpperCase(),
        trialDays,
        applicationFeePct: applicationFeePct ?? undefined,
        isActive: true,
      },
    });

    return NextResponse.json(plan);
  } catch (e: any) {
    const msg = e?.message || "Erro ao criar plano";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
