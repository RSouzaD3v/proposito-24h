// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

// Garante Node runtime para ler raw body com req.text()
export const runtime = "nodejs";

function tryConstructEvent(body: string, sig: string | null) {
  if (!sig) throw new Error("Missing Stripe signature");

  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET,            // master (Conta)
    process.env.STRIPE_WEBHOOK_SECRET_CONNECT,    // Connect (contas conectadas)
  ].filter(Boolean) as string[];

  if (!secrets.length) {
    throw new Error("Webhook secrets not configured");
  }

  let lastErr: unknown = null;

  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(body, sig, secret);
    } catch (err) {
      lastErr = err;
      // tenta próximo secret
    }
  }

  throw lastErr ?? new Error("Unable to verify event");
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  try {
    const event = tryConstructEvent(body, sig);
    const fromAccount = (event as any).account as string | undefined; // presente quando vier de connected account

    console.log("🔔 Evento:", event.type, "| account:", fromAccount ?? "master");

    switch (event.type) {
      /**
       * 1) Checkout finalizado → pode ser subscription (writer) ou pagamento único (livro)
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("✅ Checkout finalizado:", {
          id: session.id,
          mode: session.mode,
          account: fromAccount ?? "master",
          metadata: session.metadata,
        });

        // --- ASSINATURA DO WRITER (criada no master OU na connected) ---
        if (session.mode === "subscription") {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          // Se vier de connected, preferimos localizar pelo stripeAccountId.
          let writer = null;
          if (fromAccount) {
            writer = await db.writer.findFirst({
              where: { stripeAccountId: fromAccount },
            });
          }
          // Fallback: tenta por customer salvo (útil quando a assinatura é feita no master)
          if (!writer && customerId) {
            writer = await db.writer.findFirst({
              where: { stripeCustomerId: customerId },
            });
          }

          if (!writer) {
            console.log("⚠️ Nenhum writer encontrado (account/customer):", {
              account: fromAccount,
              customerId,
            });
            break;
          }

          await db.writerSubscription.upsert({
            where: { stripeId: subscriptionId },
            update: { stripe: session as any },
            create: {
              writerId: writer.id,
              stripeId: subscriptionId,
              description: "Assinatura inicial",
              amount: 0, // atualizado depois em invoice.paid
              endedAt: new Date(),
              stripe: session as any,
            },
          });

          console.log("💾 Assinatura vinculada ao writer:", writer.id);
        }

        // --- COMPRA DE LIVRO (pagamento único) ---
        if (session.mode === "payment") {
          const customerId = session.customer as string;
          const paymentIntentId = session.payment_intent as string;

          const publicationId = session.metadata?.publicationId;
          const writerId = session.metadata?.writerId;

          // aceita tanto client_reference_id quanto metadata.userId
          const userId =
            (session.client_reference_id as string | null) ||
            (session.metadata?.userId as string | undefined) ||
            null;

          if (!publicationId || !writerId || !userId) {
            console.log("⚠️ Metadados faltando para criar purchase:", {
              publicationId,
              writerId,
              userId,
              sessionId: session.id,
            });
            break;
          }

          // Evita duplicata caso webhook seja reenviado
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

      /**
       * 2) Invoice paga → atualiza assinatura do writer
       *    (pode vir do master OU de uma connected; se for connected, usamos event.account)
       */
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        let subscriptionId = (invoice as any).subscription ?? null;

        // fallback raro: tenta buscar a subscription pelo customer
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

        // Preferir account quando vier de connected
        let writer = null;
        if (fromAccount) {
          writer = await db.writer.findFirst({
            where: { stripeAccountId: fromAccount },
          });
        }
        // Fallback pelo customer (útil quando sua assinatura roda no master)
        if (!writer && invoice.customer) {
          writer = await db.writer.findFirst({
            where: { stripeCustomerId: invoice.customer as string },
          });
        }

        if (!writer) {
          console.log("⚠️ Nenhum writer encontrado p/ invoice:", {
            account: fromAccount,
            customer: invoice.customer,
          });
          break;
        }

        const firstLine = invoice.lines?.data?.[0];
        const period = firstLine?.period ?? { end: Math.floor(Date.now() / 1000) };

        await db.writerSubscription.upsert({
          where: { stripeId: subscriptionId },
          update: {
            amount: (invoice.amount_paid ?? 0) / 100,
            endedAt: new Date((period.end ?? Math.floor(Date.now() / 1000)) * 1000),
            stripe: invoice as any,
          },
          create: {
            writerId: writer.id,
            stripeId: subscriptionId,
            description: "Assinatura ativa",
            amount: (invoice.amount_paid ?? 0) / 100,
            endedAt: new Date((period.end ?? Math.floor(Date.now() / 1000)) * 1000),
            stripe: invoice as any,
          },
          // se você tiver unique em (stripeId) já garante idempotência
        });

        console.log("💾 WriterSubscription atualizada:", { writerId: writer.id, subscriptionId });
        break;
      }

      case "invoice.payment_failed": {
        console.log("⚠️ Pagamento de fatura falhou");
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db.writerSubscription.deleteMany({
          where: { stripeId: subscription.id },
        });
        console.log("❌ Assinatura cancelada:", subscription.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Erro no webhook:", err?.message ?? err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 400 });
  }
}
