import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  handleByAsaasSubscriptionId,
  handlePurchaseWebhook,
  handleReaderPaymentRef,
  handleWriterPlatformWebhook,
  resolveExternalReference,
  resolvePaymentPayload,
  webhookEventId,
  type WebhookBody,
} from "@/lib/asaasWebhook";

export const runtime = "nodejs";

const PROCESSED_EVENTS = new Set([
  "PAYMENT_RECEIVED",
  "PAYMENT_CONFIRMED",
  "PAYMENT_OVERDUE",
  "PAYMENT_DELETED",
  "PAYMENT_REFUNDED",
  "PAYMENT_RESTORED",
]);

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

  const event = body.event ?? "";
  if (event && !PROCESSED_EVENTS.has(event)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const eventId = webhookEventId(body);
  try {
    await db.asaasWebhookEvent.create({ data: { id: eventId } });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const payment = body.payment;

  try {
    if (!payment) {
      return NextResponse.json({ received: true });
    }

    const full = await resolvePaymentPayload(payment);

    await handlePurchaseWebhook(full, event);
    await handleReaderPaymentRef(full, event);

    const ext = await resolveExternalReference(full);
    await handleWriterPlatformWebhook(full, event, ext ?? null);

    if (full.subscription) {
      await handleByAsaasSubscriptionId(full, event);
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
