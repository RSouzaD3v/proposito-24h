import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import {
  asaasRedirectCallback,
  centsToAsaasValue,
  createPayment,
  createSubscription,
  formatDateYmd,
  addDays,
  getFirstInvoiceUrlForSubscription,
  getOrCreateAsaasCustomerForUser,
  subscriptionIntervalToCycle,
  type AsaasSubscriptionCycle,
} from "@/lib/asaas";
import { resolveCpfCnpjForAsaas } from "@/lib/billingCpf";
import { readerSubscriptionIsActive } from "@/lib/readerSubscription";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ writerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userReader = await db.user.findUnique({
    where: { id: session?.user.id },
    select: {
      writer: { select: { slug: true } },
    },
  });

  if (!userReader) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const userId = session.user.id;
  const { writerId } = await params;
  const body = (await req.json()) as {
    planId?: string;
    successUrl?: string;
    cancelUrl?: string;
    cpfCnpj?: string;
  };
  const { planId, successUrl } = body;

  const writer = await db.writer.findUnique({ where: { id: writerId } });
  if (!writer) {
    return NextResponse.json({ error: "Escritor não encontrado" }, { status: 404 });
  }

  const plan = await db.writerSubscriptionPlan.findFirst({
    where: { writerId, id: planId ?? undefined, isActive: true },
    orderBy: [{ amountCents: "asc" }],
  });
  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado/ativo" }, { status: 404 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const cpf = resolveCpfCnpjForAsaas(body.cpfCnpj, user.cpfCnpj);
  if (!cpf.ok) {
    return NextResponse.json({ error: cpf.message }, { status: 400 });
  }

  const asaasCustomerId = await getOrCreateAsaasCustomerForUser({
    id: user.id,
    email: user.email,
    name: user.name,
    asaasCustomerId: user.asaasCustomerId,
    cpfCnpj: cpf.digits,
  });

  await db.user.update({
    where: { id: userId },
    data: { asaasCustomerId, cpfCnpj: cpf.digits },
  });

  const existing = await db.readerSubscription.findUnique({
    where: { reader_writer_unique: { readerId: userId, writerId } },
  });

  if (existing && readerSubscriptionIsActive(existing)) {
      return NextResponse.json(
        { error: "Você já possui uma assinatura ativa ou em período de teste." },
        { status: 400 }
      );
  }

  const readerSub = await db.readerSubscription.upsert({
    where: { reader_writer_unique: { readerId: userId, writerId } },
    update: {
      priceId: plan.id,
      status: "INCOMPLETE",
      cancelAtPeriodEnd: false,
      cancelAt: null,
    },
    create: {
      readerId: userId,
      writerId,
      priceId: plan.id,
      status: "INCOMPLETE",
      metadata: {},
    },
  });

  let successPath = "/reader/area/";
  if (successUrl) {
    try {
      const u = new URL(successUrl);
      successPath = `${u.pathname}${u.search}`;
    } catch {
      /* mantém default */
    }
  }
  const redirectCb = asaasRedirectCallback(successPath);

  const cycle = subscriptionIntervalToCycle(plan.interval);

  try {
    if (cycle === "LIFETIME") {
      const payment = await createPayment({
        customer: asaasCustomerId,
        value: centsToAsaasValue(plan.amountCents),
        dueDate: formatDateYmd(new Date()),
        billingType: "UNDEFINED",
        externalReference: `reader_sub:${readerSub.id}:lifetime`,
        description: `Acesso — ${writer.name}`,
        ...(redirectCb ? { callback: redirectCb } : {}),
      });

      await db.readerSubscription.update({
        where: { id: readerSub.id },
        data: {
          lifetime: true,
          latestInvoiceId: payment.id,
        },
      });

      if (!payment.invoiceUrl) {
        return NextResponse.json(
          { error: "Cobrança criada sem link de pagamento." },
          { status: 502 }
        );
      }
      return NextResponse.json({ url: payment.invoiceUrl });
    }

    const trialDays = plan.trialDays;
    const nextDue = formatDateYmd(addDays(new Date(), trialDays));

    const sub = await createSubscription({
      customer: asaasCustomerId,
      value: centsToAsaasValue(plan.amountCents),
      nextDueDate: nextDue,
      cycle: cycle as AsaasSubscriptionCycle,
      billingType: "UNDEFINED",
      externalReference: `reader_sub:${readerSub.id}`,
      description: `Assinatura — ${writer.name}`,
      ...(redirectCb ? { callback: redirectCb } : {}),
    });

    const trialStart = new Date();
    const trialEnd = addDays(trialStart, trialDays);

    await db.readerSubscription.update({
      where: { id: readerSub.id },
      data: {
        asaasSubscriptionId: sub.id,
        lifetime: false,
        ...(trialDays > 0
          ? {
              status: "TRIALING",
              currentPeriodStart: trialStart,
              currentPeriodEnd: trialEnd,
            }
          : {}),
      },
    });

    const invoiceUrl = await getFirstInvoiceUrlForSubscription(sub.id);
    if (!invoiceUrl) {
      return NextResponse.json(
        { error: "Assinatura criada, mas não foi possível obter o link de pagamento." },
        { status: 502 }
      );
    }
    return NextResponse.json({ url: invoiceUrl });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro no checkout Asaas" },
      { status: 500 }
    );
  }
}
