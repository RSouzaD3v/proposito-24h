import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import {
  asaasRedirectCallback,
  centsToAsaasValue,
  createSubscription,
  formatDateYmd,
  addDays,
  getFirstInvoiceUrlForSubscription,
  getOrCreateAsaasCustomerForWriter,
  type AsaasSubscriptionCycle,
} from "@/lib/asaas";
import { resolveCpfCnpjForAsaas } from "@/lib/billingCpf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
  }

  let body: { cpfCnpj?: string } = {};
  try {
    body = (await req.json()) as { cpfCnpj?: string };
  } catch {
    body = {};
  }

  const userWriter = await db.user.findUnique({
    where: { id: session.user.id },
    include: { writer: true },
  });

  if (!userWriter?.writerId || !userWriter.writer) {
    return NextResponse.json({ error: "Writer não encontrado" }, { status: 404 });
  }

  const cpf = resolveCpfCnpjForAsaas(body.cpfCnpj, userWriter.cpfCnpj);
  if (!cpf.ok) {
    return NextResponse.json({ error: cpf.message }, { status: 400 });
  }

  const writer = userWriter.writer;
  const valueCents = Number(process.env.ASAAS_WRITER_SUBSCRIPTION_VALUE_CENTS ?? "9990");
  if (!Number.isFinite(valueCents) || valueCents < 100) {
    return NextResponse.json(
      { error: "ASAAS_WRITER_SUBSCRIPTION_VALUE_CENTS inválido (mín. 100)" },
      { status: 500 }
    );
  }

  const cycle = (process.env.ASAAS_WRITER_SUBSCRIPTION_CYCLE ?? "MONTHLY") as AsaasSubscriptionCycle;

  const trialDaysRaw = process.env.ASAAS_WRITER_TRIAL_DAYS ?? "7";
  const trialDays = Math.max(0, Math.min(365, Number(trialDaysRaw)));
  const nextDueDate = formatDateYmd(addDays(new Date(), Number.isFinite(trialDays) ? trialDays : 7));

  try {
    const customerId = await getOrCreateAsaasCustomerForWriter({
      id: writer.id,
      email: userWriter.email,
      name: userWriter.name,
      asaasCustomerId: writer.asaasCustomerId,
      cpfCnpj: cpf.digits,
    });

    await db.user.update({
      where: { id: userWriter.id },
      data: { cpfCnpj: cpf.digits },
    });

    await db.writer.update({
      where: { id: writer.id },
      data: { asaasCustomerId: customerId },
    });

    const externalReference = `writer_platform:${writer.id}`;
    const redirectCb = asaasRedirectCallback("/writer/subscription/success");

    const sub = await createSubscription({
      customer: customerId,
      value: centsToAsaasValue(valueCents),
      nextDueDate,
      cycle,
      externalReference,
      description: "Assinatura escritor — plataforma",
      ...(redirectCb ? { callback: redirectCb } : {}),
    });

    await db.writerSubscription.create({
      data: {
        writerId: writer.id,
        asaasSubscriptionId: sub.id,
        amount: valueCents,
        description: "Assinatura escritor (plataforma)",
        endedAt: sub.nextDueDate ? new Date(`${sub.nextDueDate}T23:59:59.000Z`) : new Date(),
        asaas: sub as object,
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
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar assinatura" },
      { status: 500 }
    );
  }
}
