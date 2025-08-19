// app/api/stripe/portal/route.ts
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // encontra o writer vinculado ao usuário
  const userWriter = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userWriter?.writerId) {
    return NextResponse.json({ error: "Not a writer" }, { status: 400 });
  }

  const writer = await db.writer.findUnique({
    where: { id: userWriter.writerId },
  });

  if (!writer?.stripeCustomerId) {
    return NextResponse.json({ error: "Writer not subscribed" }, { status: 400 });
  }

  // cria a sessão do portal
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: writer.stripeCustomerId,
    return_url: process.env.BASE_URL + "/writer/dashboard", // onde o usuário volta
  });

  return NextResponse.json({ url: portalSession.url });
}
