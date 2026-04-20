import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import {
  asaasRedirectCallback,
  centsToAsaasValue,
  createPayment,
  formatDateYmd,
  getOrCreateAsaasCustomerForUser,
} from "@/lib/asaas";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ publicationId: string }> }
) {
  const session = await getServerSession(authOptions);

  const userReader = await db.user.findUnique({
    where: { id: session?.user.id },
    select: { id: true },
  });

  if (!userReader) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User não encontrado" }, { status: 404 });
  }

  const { publicationId } = await params;

  const pub = await db.publication.findUnique({
    where: { id: publicationId },
    include: { writer: true },
  });

  if (!pub || pub.visibility !== "PAID" || !pub.price || pub.price < 1) {
    return NextResponse.json({ error: "Publicação inválida ou sem preço" }, { status: 400 });
  }

  const callback = asaasRedirectCallback(
    `/reader/area/courses/${publicationId}?paid=1`
  );

  const customerId = await getOrCreateAsaasCustomerForUser({
    id: user.id,
    email: user.email,
    name: user.name,
    asaasCustomerId: user.asaasCustomerId,
  });

  await db.user.update({
    where: { id: user.id },
    data: { asaasCustomerId: customerId },
  });

  const purchase = await db.purchase.create({
    data: {
      userId: user.id,
      publicationId: pub.id,
      writerId: pub.writerId,
      amount: pub.price,
      currency: (pub.currency || "BRL").toUpperCase(),
      status: "PENDING",
      provider: "ASAAS",
    },
  });

  try {
    const payment = await createPayment({
      customer: customerId,
      value: centsToAsaasValue(pub.price),
      dueDate: formatDateYmd(new Date()),
      billingType: "UNDEFINED",
      externalReference: `purchase:${purchase.id}`,
      description: pub.title,
      ...(callback ? { callback } : {}),
    });

    await db.purchase.update({
      where: { id: purchase.id },
      data: { asaasPaymentId: payment.id },
    });

    if (!payment.invoiceUrl) {
      return NextResponse.json(
        { error: "Cobrança criada sem link de pagamento." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: payment.invoiceUrl }, { status: 200 });
  } catch (e: unknown) {
    console.error(e);
    await db.purchase.deleteMany({ where: { id: purchase.id } }).catch(() => {});
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao criar cobrança" },
      { status: 500 }
    );
  }
}
