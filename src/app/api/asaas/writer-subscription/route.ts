import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import {
  asaasRedirectCallback,
  centsToAsaasValue,
  createSubscription,
  formatDateYmd,
  getFirstInvoiceUrlForSubscription,
  getOrCreateAsaasCustomerForWriter,
  type AsaasSubscriptionCycle,
} from "@/lib/asaas";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
  }

  const userWriter = await db.user.findUnique({
    where: { id: session.user.id },
    include: { writer: true },
  });

  if (!userWriter?.writerId || !userWriter.writer) {
    return NextResponse.json({ error: "Writer não encontrado" }, { status: 404 });
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

  try {
    const customerId = await getOrCreateAsaasCustomerForWriter({
      id: writer.id,
      email: userWriter.email,
      name: userWriter.name,
      asaasCustomerId: writer.asaasCustomerId,
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
      nextDueDate: formatDateYmd(new Date()),
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
