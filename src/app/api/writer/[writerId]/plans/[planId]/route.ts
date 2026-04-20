import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertWriterAdmin } from "@/lib/authz";

export const runtime = "nodejs";

/**
 * PUT: altera valores do plano (somente banco local; Asaas usa valor/ciclo na criação da assinatura).
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

  const updated = await db.writerSubscriptionPlan.update({
    where: { id: planId },
    data: {
      amountCents: typeof amountCents === "number" ? amountCents : plan.amountCents,
      currency: (currency ?? plan.currency).toUpperCase(),
      interval: interval ?? plan.interval,
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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { isActive: isActiveRaw, isReaderVisible: isReaderVisibleRaw } = body;

  const data: Record<string, boolean> = {};

  if (typeof isActiveRaw === "boolean") {
    data.isActive = isActiveRaw;
  } else if (typeof isActiveRaw === "string") {
    if (isActiveRaw === "true" || isActiveRaw === "false") {
      data.isActive = isActiveRaw === "true";
    }
  }

  if (typeof isReaderVisibleRaw === "boolean") {
    data.isReaderVisible = isReaderVisibleRaw;
  } else if (typeof isReaderVisibleRaw === "string") {
    if (isReaderVisibleRaw === "true" || isReaderVisibleRaw === "false") {
      data.isReaderVisible = isReaderVisibleRaw === "true";
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const existing = await db.writerSubscriptionPlan.findFirst({
    where: { id: planId, writerId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
  }

  const updated = await db.writerSubscriptionPlan.update({
    where: { id: planId },
    data,
  });

  return NextResponse.json(updated);
}
