import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if(!session) {
        return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const userWriter = await db.user.findUnique({
        where: { id: session.user.id }
    });

    if(!userWriter || !userWriter.writerId) {
        return NextResponse.json({ error: "Writer não encontrado" }, { status: 404 });
    }

  try {

    const writer = await db.writer.findUnique({ where: { id: userWriter?.writerId } });
    if (!writer) {
      return NextResponse.json({ error: "Writer não encontrado" }, { status: 404 });
    }

    // ⚡ 1. Criar Customer se não existir
    let stripeCustomerId = (writer as any).stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userWriter.email ?? "writer@exemplo.com",
        name: userWriter.name ?? "Writer",
        metadata: { writerId: userWriter?.writerId },
      });
      stripeCustomerId = customer.id;

      await db.writer.update({
        where: { id: userWriter?.writerId },
        data: { stripeCustomerId },
      });
    }

    // ⚡ 2. Criar Checkout Session para assinatura
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!, // ⚡ ID do plano criado no Dashboard
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/writer/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/writer/subscription/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
