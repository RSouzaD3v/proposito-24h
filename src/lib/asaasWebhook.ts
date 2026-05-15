import { db } from "@/lib/db";
import {
  getPayment,
  getSubscription,
  asaasValueToCents,
  type AsaasPayment,
} from "@/lib/asaas";
import { readerSubscriptionIsActive } from "@/lib/readerSubscription";

export type WebhookBody = {
  id?: string;
  event?: string;
  payment?: AsaasPayment & { netValue?: number; value?: number };
};

export function webhookEventId(body: WebhookBody): string {
  if (body.id?.trim()) return body.id.trim();
  const payId = body.payment?.id ?? "unknown";
  const evt = body.event ?? "evt";
  return `${payId}_${evt}`;
}

export function parseExternalRef(ref: string | null | undefined) {
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

function periodEndFromAsaas(nextDueDate: string | undefined | null): Date | null {
  if (!nextDueDate) return null;
  return new Date(`${nextDueDate}T23:59:59.000Z`);
}

function paymentOk(event: string): boolean {
  return event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED";
}

function paymentFail(event: string): boolean {
  return event === "PAYMENT_DELETED" || event === "PAYMENT_REFUNDED";
}

export async function syncReaderFromAsaasSubscription(
  localId: string,
  asaasSubId: string,
  event: string
) {
  const local = await db.readerSubscription.findUnique({ where: { id: localId } });
  if (!local) return;

  const sub = await getSubscription(asaasSubId);
  const nextEnd = periodEndFromAsaas(sub.nextDueDate);
  const now = new Date();

  if (paymentFail(event) || sub.status === "INACTIVE" || sub.status === "EXPIRED") {
    if (local.cancelAtPeriodEnd && local.currentPeriodEnd && local.currentPeriodEnd > now) {
      return;
    }
    await db.readerSubscription.update({
      where: { id: localId },
      data: { status: "CANCELED", currentPeriodEnd: nextEnd ?? local.currentPeriodEnd },
    });
    return;
  }

  if (!paymentOk(event) && event !== "PAYMENT_OVERDUE") return;

  if (event === "PAYMENT_OVERDUE") {
    await db.readerSubscription.update({
      where: { id: localId },
      data: { status: "PAST_DUE" },
    });
    return;
  }

  const stillTrialing =
    local.status === "TRIALING" &&
    local.currentPeriodEnd &&
    local.currentPeriodEnd > now;

  await db.readerSubscription.update({
    where: { id: localId },
    data: {
      asaasSubscriptionId: asaasSubId,
      status: stillTrialing ? "TRIALING" : "ACTIVE",
      currentPeriodEnd: nextEnd ?? local.currentPeriodEnd,
      ...(stillTrialing ? {} : { cancelAtPeriodEnd: false }),
    },
  });
}

export async function handlePurchaseWebhook(
  payment: AsaasPayment,
  event: string
) {
  const ref = parseExternalRef(payment.externalReference ?? undefined);
  if (!ref || ref.kind !== "purchase") return;

  const purchase = await db.purchase.findUnique({ where: { id: ref.id } });
  if (!purchase) return;

  if (purchase.asaasPaymentId && purchase.asaasPaymentId !== payment.id && purchase.status === "SUCCESS") {
    return;
  }

  if (paymentOk(event)) {
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

  if (paymentFail(event)) {
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

export async function handleReaderPaymentRef(
  payment: AsaasPayment,
  event: string
) {
  const ref = parseExternalRef(payment.externalReference ?? undefined);
  if (!ref || (ref.kind !== "reader_sub" && ref.kind !== "reader_sub_lifetime")) return;

  const local = await db.readerSubscription.findUnique({
    where: { id: ref.readerSubscriptionId },
  });
  if (!local) return;

  if (ref.kind === "reader_sub_lifetime" && paymentOk(event)) {
    await db.readerSubscription.update({
      where: { id: local.id },
      data: {
        status: "ACTIVE",
        lifetime: true,
        latestInvoiceId: payment.id,
        cancelAtPeriodEnd: false,
      },
    });
    return;
  }

  if (payment.subscription) {
    await syncReaderFromAsaasSubscription(local.id, payment.subscription, event);
    return;
  }

  if (paymentOk(event)) {
    const now = new Date();
    const inTrial =
      local.status === "TRIALING" &&
      local.currentPeriodEnd &&
      local.currentPeriodEnd > now;

    await db.readerSubscription.update({
      where: { id: local.id },
      data: {
        status: inTrial ? "TRIALING" : "ACTIVE",
        latestInvoiceId: payment.id,
        ...(payment.subscription ? { asaasSubscriptionId: payment.subscription } : {}),
      },
    });
  }
}

export async function handleWriterPlatformWebhook(
  payment: AsaasPayment,
  event: string,
  externalRef: string | null | undefined
) {
  const ref = parseExternalRef(externalRef);
  if (!ref || ref.kind !== "writer_platform") return;
  if (!paymentOk(event)) return;

  const subId = payment.subscription;
  if (!subId) return;

  const sub = await getSubscription(subId);
  const amountCents = asaasValueToCents(payment.value ?? sub.value);
  const periodEnd = periodEndFromAsaas(sub.nextDueDate) ?? new Date();

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

export async function handleByAsaasSubscriptionId(
  payment: AsaasPayment,
  event: string
) {
  const subId = payment.subscription;
  if (!subId) return;

  const reader = await db.readerSubscription.findFirst({
    where: { asaasSubscriptionId: subId },
  });

  if (reader) {
    await syncReaderFromAsaasSubscription(reader.id, subId, event);
    return;
  }

  const writerSub = await db.writerSubscription.findFirst({
    where: { asaasSubscriptionId: subId },
  });

  if (writerSub && paymentOk(event)) {
    const sub = await getSubscription(subId);
    const amountCents = asaasValueToCents(payment.value ?? sub.value);
    const periodEnd = periodEndFromAsaas(sub.nextDueDate) ?? new Date();
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

export async function resolvePaymentPayload(
  payment: NonNullable<WebhookBody["payment"]>
): Promise<AsaasPayment> {
  if (!payment.id) return payment;
  try {
    return await getPayment(payment.id);
  } catch {
    return payment;
  }
}

export async function resolveExternalReference(
  payment: AsaasPayment
): Promise<string | undefined> {
  let ext = payment.externalReference ?? undefined;
  if (payment.subscription && !ext) {
    try {
      const s = await getSubscription(payment.subscription);
      ext = s.externalReference ?? undefined;
    } catch {
      /* */
    }
  }
  return ext;
}
