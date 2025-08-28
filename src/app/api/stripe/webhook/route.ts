// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export const runtime = "nodejs";

/** Helpers */
function isReaderToWriter(meta?: Record<string, string> | null) {
  if (!meta) return false;
  return meta.kind === "reader_to_writer_subscription" || !!meta.readerSubscriptionId;
}

function toDateOrNull(ts?: number | null) {
  return ts ? new Date(ts * 1000) : null;
}

async function updateReaderSubFromStripeSub(readerSubscriptionId: string, sub: Stripe.Subscription, extra?: { latestInvoiceId?: string }) {
  await db.readerSubscription.update({
    where: { id: readerSubscriptionId },
    data: {
      stripeSubscriptionId: sub.id,
      status: (sub.status || "incomplete").toUpperCase() as any,
      currentPeriodStart: toDateOrNull(sub.start_date),
      currentPeriodEnd: toDateOrNull(sub.ended_at),
      cancelAt: toDateOrNull(sub.cancel_at || null),
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      ...(extra?.latestInvoiceId ? { latestInvoiceId: extra.latestInvoiceId } : {}),
    },
  });
}

function tryConstructEvent(body: string, sig: string | null) {
  if (!sig) throw new Error("Missing Stripe signature");
  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET,         // master
    process.env.STRIPE_WEBHOOK_SECRET_CONNECT, // connected
  ].filter(Boolean) as string[];

  let lastErr: unknown = null;
  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(body, sig, secret);
    } catch (err) { lastErr = err; }
  }
  throw lastErr ?? new Error("Unable to verify event");
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  try {
    const event = tryConstructEvent(body, sig);
    const fromAccount = (event as any).account as string | undefined;

    console.log("🔔 Evento:", event.type, "| account:", fromAccount ?? "master");

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = (session.metadata ?? {}) as Record<string, string>;

        console.log("✅ Checkout finalizado:", {
          id: session.id,
          mode: session.mode,
          account: fromAccount ?? "master",
          metadata: meta,
        });

        // ========= (A) Assinatura LEITOR → ESCRITOR =========
        if (session.mode === "subscription" && isReaderToWriter(meta)) {
          const subscriptionId = session.subscription as string;
          // busque a subscription para pegar metadados garantidos:
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const subMeta = (sub.metadata ?? {}) as Record<string, string>;
          const readerSubscriptionId = subMeta.readerSubscriptionId || meta.readerSubscriptionId;

          if (!readerSubscriptionId) {
            console.log("⚠️ Sem readerSubscriptionId no metadata da assinatura");
            break;
          }

          await updateReaderSubFromStripeSub(readerSubscriptionId, sub, {
            latestInvoiceId: typeof session.invoice === "string" ? session.invoice : undefined,
          });

          console.log("💾 ReaderSubscription atualizada (checkout):", { readerSubscriptionId, subscriptionId });
          break; // evita cair nas lógicas de writer/purchase
        }

        // ========= (B) Assinatura do WRITER com a plataforma (lógica já existente) =========
        if (session.mode === "subscription") {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          let writer = null;
          if (fromAccount) {
            writer = await db.writer.findFirst({ where: { stripeAccountId: fromAccount } });
          }
          if (!writer && customerId) {
            writer = await db.writer.findFirst({ where: { stripeCustomerId: customerId } });
          }
          if (!writer) {
            console.log("⚠️ Nenhum writer encontrado (account/customer).");
            break;
          }

          await db.writerSubscription.upsert({
            where: { stripeId: subscriptionId },
            update: { stripe: session as any },
            create: {
              writerId: writer.id,
              stripeId: subscriptionId,
              description: "Assinatura inicial",
              // ⚠️ se mudou p/ amountCents Int, troque para amountCents: 0
              amount: 0,
              endedAt: new Date(),
              stripe: session as any,
            },
          });

          console.log("💾 Assinatura vinculada ao writer:", writer.id);
        }

        // ========= (C) Compra avulsa (lógica já existente) =========
        if (session.mode === "payment") {
          const customerId = session.customer as string;
          const paymentIntentId = session.payment_intent as string;
          const publicationId = session.metadata?.publicationId;
          const writerId = session.metadata?.writerId;
          const userId =
            (session.client_reference_id as string | null) ||
            (session.metadata?.userId as string | undefined) ||
            null;

          if (!publicationId || !writerId || !userId) {
            console.log("⚠️ Metadados faltando para criar purchase:", {
              publicationId, writerId, userId, sessionId: session.id,
            });
            break;
          }

          const existing = await db.purchase.findFirst({
            where: { stripeSessionId: session.id },
            select: { id: true },
          });
          if (existing) {
            console.log("↩️ Purchase já existe para session:", session.id);
            break;
          }

          await db.purchase.create({
            data: {
              userId,
              publicationId,
              writerId,
              amount: session.amount_total ?? 0,
              currency: (session.currency ?? "BRL").toUpperCase(),
              status: "SUCCESS",
              provider: "STRIPE",
              stripeSessionId: session.id,
              stripePaymentIntentId: paymentIntentId,
              stripeCustomerId: customerId,
              rawProviderPayload: session as any,
            },
          });

          console.log("💾 Purchase criada:", { userId, publicationId, writerId });
        }

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        // Tenta descobrir se é assinatura Reader→Writer olhando metadata da assinatura
        let subscriptionId = ((invoice as any).subscription as string) ?? null;
        if (!subscriptionId && invoice.customer) {
          const subs = await stripe.subscriptions.list({
            customer: invoice.customer as string,
            limit: 1,
          });
          subscriptionId = subs.data[0]?.id ?? null;
          console.log("🔄 Fallback subscriptionId:", subscriptionId);
        }
        if (!subscriptionId) {
          console.log("⚠️ invoice sem subscriptionId:", invoice.id);
          break;
        }

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const subMeta = (sub.metadata ?? {}) as Record<string, string>;

        // ========= (A) Assinatura LEITOR → ESCRITOR =========
        if (isReaderToWriter(subMeta)) {
          const readerSubscriptionId = subMeta.readerSubscriptionId;
          if (!readerSubscriptionId) {
            console.log("⚠️ Sem readerSubscriptionId no metadata da assinatura");
            break;
          }

          await updateReaderSubFromStripeSub(readerSubscriptionId, sub, {
            latestInvoiceId: invoice.id,
          });

          console.log("💾 ReaderSubscription atualizada (invoice.paid):", { readerSubscriptionId, subscriptionId });
          break; // não cair na lógica de writer
        }

        // ========= (B) Assinatura do WRITER com a plataforma (lógica já existente) =========
        let writer = null;
        if (fromAccount) {
          writer = await db.writer.findFirst({ where: { stripeAccountId: fromAccount } });
        }
        if (!writer && invoice.customer) {
          writer = await db.writer.findFirst({ where: { stripeCustomerId: invoice.customer as string } });
        }
        if (!writer) {
          console.log("⚠️ Nenhum writer encontrado p/ invoice:", {
            account: fromAccount, customer: invoice.customer,
          });
          break;
        }

        const firstLine = invoice.lines?.data?.[0];
        const period = firstLine?.period ?? { end: Math.floor(Date.now() / 1000) };

        await db.writerSubscription.upsert({
          where: { stripeId: subscriptionId },
          update: {
            // ⚠️ se mudou p/ amountCents, use amountCents: (invoice.amount_paid ?? 0)
            amount: (invoice.amount_paid ?? 0) / 100,
            endedAt: new Date((period.end ?? Math.floor(Date.now() / 1000)) * 1000),
            stripe: invoice as any,
          },
          create: {
            writerId: writer.id,
            stripeId: subscriptionId,
            description: "Assinatura ativa",
            // ⚠️ idem comentário acima
            amount: (invoice.amount_paid ?? 0) / 100,
            endedAt: new Date((period.end ?? Math.floor(Date.now() / 1000)) * 1000),
            stripe: invoice as any,
          },
        });

        console.log("💾 WriterSubscription atualizada:", { writerId: writer.id, subscriptionId });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription as string | null;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const subMeta = (sub.metadata ?? {}) as Record<string, string>;
          if (isReaderToWriter(subMeta) && subMeta.readerSubscriptionId) {
            await db.readerSubscription.update({
              where: { id: subMeta.readerSubscriptionId },
              data: { status: "PAST_DUE", latestInvoiceId: invoice.id },
            });
            console.log("⚠️ ReaderSubscription marcada como PAST_DUE:", subMeta.readerSubscriptionId);
            break;
          }
        }
        console.log("⚠️ Pagamento de fatura falhou (não-R→W ou sem subId)");
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subMeta = (subscription.metadata ?? {}) as Record<string, string>;

        if (isReaderToWriter(subMeta) && subMeta.readerSubscriptionId) {
          await updateReaderSubFromStripeSub(subMeta.readerSubscriptionId, subscription);
          console.log("🔄 ReaderSubscription atualizada (updated):", subMeta.readerSubscriptionId);
          break;
        }

        // (opcional) atualizar WriterSubscription aqui também, se quiser espelhar alterações
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subMeta = (subscription.metadata ?? {}) as Record<string, string>;

        if (isReaderToWriter(subMeta) && subMeta.readerSubscriptionId) {
          await db.readerSubscription.update({
            where: { id: subMeta.readerSubscriptionId },
            data: { status: "CANCELED", cancelAt: new Date(), cancelAtPeriodEnd: true },
          });
          console.log("❌ ReaderSubscription cancelada:", subMeta.readerSubscriptionId);
          break;
        }

        // lógica existente do writer (você já tinha):
        await db.writerSubscription.deleteMany({ where: { stripeId: subscription.id } });
        console.log("❌ WriterSubscription cancelada:", subscription.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Erro no webhook:", err?.message ?? err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 400 });
  }
}
