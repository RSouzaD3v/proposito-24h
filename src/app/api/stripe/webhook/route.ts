import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("🔔 Evento:", event.type);

    switch (event.type) {
      /**
       * 1) Checkout finalizado → salva stripeCustomerId e subscriptionId
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("✅ Checkout finalizado:", session.id);

        if (session.mode === "subscription") {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          // pega writer pelo id do customer (definido no momento da criação da sessão de checkout)
          const writer = await db.writer.findFirst({
            where: { stripeCustomerId: customerId },
          });

          // se ainda não existir, precisa já criar um writer (ou dar erro controlado)
          if (!writer) {
            console.log("⚠️ Nenhum writer encontrado para o customerId:", customerId);
            break;
          }

          await db.writerSubscription.upsert({
            where: { stripeId: subscriptionId },
            update: {
              stripe: session as any,
            },
            create: {
              writerId: writer.id,
              stripeId: subscriptionId,
              description: "Assinatura inicial",
              amount: 0, // atualizado no invoice.paid
              endedAt: new Date(),
              stripe: session as any,
            },
          });

          console.log(
            "💾 Writer vinculado ao customer e assinatura criada:",
            writer.id
          );
        }
        break;
      }

      /**
       * 2) Invoice paga → atualiza assinatura
       */
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        let subscriptionId = (invoice as any).subscription as string | null;

        // fallback: buscar assinatura se não veio no invoice
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

        const writer = await db.writer.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        });

        if (writer) {
          const period = invoice.lines.data[0].period;

          await db.writerSubscription.upsert({
            where: { stripeId: subscriptionId },
            update: {
              amount: invoice.amount_paid / 100,
              endedAt: new Date(period.end * 1000),
              stripe: invoice as any,
            },
            create: {
              writerId: writer.id,
              stripeId: subscriptionId,
              description: "Assinatura ativa",
              amount: invoice.amount_paid / 100,
              endedAt: new Date(period.end * 1000),
              stripe: invoice as any,
            },
          });

          console.log("💾 WriterSubscription atualizada:", writer.id);
        } else {
          console.log("⚠️ Nenhum writer encontrado para customer:", invoice.customer);
        }
        break;
      }

      /**
       * 3) Falha de pagamento
       */
      case "invoice.payment_failed": {
        console.log("⚠️ Pagamento de fatura falhou");
        break;
      }

      /**
       * 4) Assinatura cancelada
       */
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
    console.error("❌ Erro no webhook:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
