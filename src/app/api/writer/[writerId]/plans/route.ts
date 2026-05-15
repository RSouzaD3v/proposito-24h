import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

  if (user?.role === "WRITER_ADMIN") {
    const plans = await db.writerSubscriptionPlan.findMany({
      where: { writerId },
      orderBy: [{ isActive: "desc" }, { amountCents: "asc" }],
      select: {
        id: true,
        interval: true,
        amountCents: true,
        currency: true,
        trialDays: true,
        applicationFeePct: true,
        isActive: true,
        createdAt: true,
        isReaderVisible: true,
      },
    });

    return NextResponse.json(plans);
  }

  const plans = await db.writerSubscriptionPlan.findMany({
    where: { writerId, isActive: true, isReaderVisible: true },
    orderBy: [{ amountCents: "asc" }],
    select: {
      id: true,
      interval: true,
      amountCents: true,
      currency: true,
      trialDays: true,
      applicationFeePct: true,
      isActive: true,
      createdAt: true,
      isReaderVisible: true,
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
      interval = "MONTH",
      trialDays = 7,
      applicationFeePct = null as number | null,
      isReaderVisible = true,
    } = body;

    if (!Number.isInteger(amountCents) || amountCents < 100) {
      return NextResponse.json({ error: "amountCents inválido (>=100)" }, { status: 400 });
    }

    const writer = await db.writer.findUnique({ where: { id: writerId } });
    if (!writer) {
      return NextResponse.json({ error: "Escritor não encontrado" }, { status: 404 });
    }

    const isLifetime = interval === "LIFETIME";
    if (isLifetime && trialDays > 0) {
      return NextResponse.json({ error: "trialDays não é permitido para LIFETIME" }, { status: 400 });
    }

    const plan = await db.writerSubscriptionPlan.create({
      data: {
        writerId,
        stripeProductId: null,
        stripePriceId: null,
        interval,
        amountCents,
        currency: currency.toUpperCase(),
        trialDays: isLifetime ? 0 : trialDays,
        applicationFeePct: applicationFeePct ?? undefined,
        isActive: true,
        isReaderVisible,
      },
    });

    return NextResponse.json(plan);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao criar plano";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
