import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db"; // ajuste conforme sua config do prisma
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWriter = await db.user.findUnique({
        where: { id: session.user.id },
    })

    if (!userWriter || !userWriter.writerId) {
      return NextResponse.json({ error: "Writer not found" }, { status: 404 });
    }

  try {
    // 1. Criar conta conectada
    const account = await stripe.accounts.create({
      type: "express",
      country: "BR", // ou o país do escritor
      email: userWriter.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // 2. Salvar no banco
    await db.writer.update({
      where: { id: userWriter.writerId },
      data: { stripeAccountId: account.id },
    });

    // 3. Criar link de onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.BASE_URL}/writer/onboarding/refresh`,
      return_url: `${process.env.BASE_URL}/writer/onboarding/return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
