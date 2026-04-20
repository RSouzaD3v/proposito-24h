import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getPayment,
  getSubscription,
  asaasValueToCents,
  type AsaasPayment,
} from "@/lib/asaas";

export const runtime = "nodejs";

type WebhookBody = {
  id?: string;
  event?: string;
  payment?: AsaasPayment & { netValue?: number; value?: number };
};

function parseExternalRef(ref: string | null | undefined) {
  if (!ref) return null;
  if (ref.startsWith("purchase:")) {
    return { kind: "purchase" as const, id: ref.slice("purchase:".length) };
  }
  if (ref.startsWith("writer_platform:")) {
    return { kind: "writer_platform" as const, writerId: ref.slice("writer_platform:".length) };
  }
  if (ref.startsWith("reader_sub:")) {
    const rest = ref.slice("reader_sub:".length);
    if (rest.endsWith(":lifetime")) {
      return {
        kind: "reader_sub_lifetime" as const,
        readerSubscriptionId: rest.slice(0, -":lifetime".length),
      };
    }
    return { kind: "reader_sub" as const, readerSubscriptionId: rest };
  }
  return null;
}

async function handlePurchase(
  payment: NonNullable<WebhookBody["payment"]>,
  event: string
) {
  const ref = parseExternalRef(payment.externalReference ?? undefined);
  if (!ref || ref.kind !== "purchase") return;

  const purchase = await db.purchase.findUnique({ where: { id: ref.id } });
  if (!purchase) return;

  const ok = event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED";
  const fail = event === "PAYMENT_DELETED" || event === "PAYMENT_REFUNDED";

  if (ok) {
    const netCents =
      payment.netValue != null ? asaasValueToCents(payment.netValue) : null;
    const feeCents =
      payment.value != null && payment.netValue != null
        ? asaasValueToCents(payment.value) - asaasValueToCents(payment.netValue)
        : null;

    await db.purchase.update({
      where: { id: purchase.id },
      data: {
        status: "SUCCESS",
        provider: "ASAAS",
        asaasPaymentId: payment.id,
        netAmount: netCents ?? purchase.netAmount,
        fees: feeCents ?? purchase.fees,
        rawProviderPayload: payment as object,
      },
    });
    return;
  }

  if (fail) {
    await db.purchase.update({
      where: { id: purchase.id },
      data: { status: "FAILED", rawProviderPayload: payment as object },
    });
  } else if (event === "PAYMENT_OVERDUE") {
    await db.purchase.update({
      where: { id: purchase.id },
      data: { status: "PENDING", rawProviderPayload: payment as object },
    });
  }
}

async function handleReaderExternalRef(
  payment: NonNullable<WebhookBody["payment"]>,
  event: string
) {
  const ref = parseExternalRef(payment.externalReference ?? undefined);
  if (!ref || (ref.kind !== "reader_sub" && ref.kind !== "reader_sub_lifetime")) return;

  const local = await db.readerSubscription.findUnique({
    where: { id: ref.readerSubscriptionId },
  });
  if (!local) return;

  if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
    await db.readerSubscription.update({
      where: { id: local.id },
      data: {
        status: "ACTIVE",
        lifetime: ref.kind === "reader_sub_lifetime",
        latestInvoiceId: payment.id,
        ...(payment.subscription ? { asaasSubscriptionId: payment.subscription } : {}),
      },
    });
  }
}

async function handleWriterPlatform(
  payment: NonNullable<WebhookBody["payment"]>,
  event: string,
  externalRef: string | null | undefined
) {
  const ref = parseExternalRef(externalRef);
  if (!ref || ref.kind !== "writer_platform") return;
  if (event !== "PAYMENT_RECEIVED" && event !== "PAYMENT_CONFIRMED") return;

  const subId = payment.subscription;
  if (!subId) return;

  const sub = await getSubscription(subId);
  const amountCents = asaasValueToCents(payment.value ?? sub.value);
  const periodEnd = sub.nextDueDate
    ? new Date(`${sub.nextDueDate}T23:59:59.000Z`)
    : new Date();

  await db.writerSubscription.upsert({
    where: { asaasSubscriptionId: subId },
    update: {
      amount: amountCents,
      endedAt: periodEnd,
      asaas: sub as object,
    },
    create: {
      writerId: ref.writerId,
      asaasSubscriptionId: subId,
      amount: amountCents,
      description: "Assinatura escritor (plataforma)",
      endedAt: periodEnd,
      asaas: sub as object,
    },
  });
}

async function handleByAsaasSubscription(
  payment: NonNullable<WebhookBody["payment"]>,
  event: string
) {
  const subId = payment.subscription;
  if (!subId) return;

  const reader = await db.readerSubscription.findFirst({
    where: { asaasSubscriptionId: subId },
  });

  if (reader) {
    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      const sub = await getSubscription(subId);
      const nextEnd = sub.nextDueDate
        ? new Date(`${sub.nextDueDate}T23:59:59.000Z`)
        : null;
      await db.readerSubscription.update({
        where: { id: reader.id },
        data: {
          status: sub.status === "ACTIVE" ? "ACTIVE" : "INCOMPLETE",
          currentPeriodEnd: nextEnd,
          cancelAtPeriodEnd: false,
        },
      });
    } else if (event === "PAYMENT_OVERDUE") {
      await db.readerSubscription.update({
        where: { id: reader.id },
        data: { status: "PAST_DUE" },
      });
    }
    return;
  }

  const writerSub = await db.writerSubscription.findFirst({
    where: { asaasSubscriptionId: subId },
  });

  if (writerSub && (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED")) {
    const sub = await getSubscription(subId);
    const amountCents = asaasValueToCents(payment.value ?? sub.value);
    const periodEnd = sub.nextDueDate
      ? new Date(`${sub.nextDueDate}T23:59:59.000Z`)
      : new Date();
    await db.writerSubscription.update({
      where: { id: writerSub.id },
      data: {
        amount: amountCents,
        endedAt: periodEnd,
        asaas: sub as object,
      },
    });
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("asaas-access-token");
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = (await req.json()) as WebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventId = body.id ?? `${body.payment?.id ?? "unknown"}_${body.event ?? "evt"}`;
  try {
    await db.asaasWebhookEvent.create({ data: { id: eventId } });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const event = body.event ?? "";
  const payment = body.payment;

  try {
    if (!payment) {
      return NextResponse.json({ received: true });
    }

    let full: NonNullable<WebhookBody["payment"]> = payment;
    if (payment.id) {
      try {
        full = await getPayment(payment.id);
      } catch {
        full = payment;
      }
    }

    await handlePurchase(full, event);
    await handleReaderExternalRef(full, event);

    let ext = full.externalReference ?? undefined;
    if (full.subscription && !ext) {
      try {
        const s = await getSubscription(full.subscription);
        ext = s.externalReference ?? undefined;
      } catch {
        /* */
      }
    }
    await handleWriterPlatform(full, event, ext ?? null);

    if (full.subscription) {
      await handleByAsaasSubscription(full, event);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("asaas webhook:", err);
    await db.asaasWebhookEvent.deleteMany({ where: { id: eventId } }).catch(() => {});
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "handler error" },
      { status: 500 }
    );
  }
}
