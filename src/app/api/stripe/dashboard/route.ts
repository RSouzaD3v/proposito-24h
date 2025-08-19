// /app/api/stripe/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth"; // ou outro auth

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session || !session.user.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const userWriter = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!userWriter || !userWriter.writerId) {
    return NextResponse.json({ error: "Writer não encontrado" }, { status: 404 });
  }

  const writer = await db.writer.findUnique({
    where: { id: userWriter.writerId },
  });

  if (!writer?.stripeAccountId) {
    return NextResponse.json({ error: "Writer sem conta Stripe" }, { status: 400 });
  }

  const loginLink = await stripe.accounts.createLoginLink(writer.stripeAccountId);

  return NextResponse.redirect(loginLink.url);
}
