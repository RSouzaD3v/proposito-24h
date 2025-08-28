import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export const runtime = "nodejs";

function absoluteUrl(path: string) {
  const base = process.env.APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await db.user.findUnique({ where: { id: session.user.id } });
  if (!me?.stripeCustomerId) {
    return NextResponse.json({ error: "Sem Stripe Customer" }, { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: me.stripeCustomerId,
    return_url: absoluteUrl("/account"),
  });

  return NextResponse.json({ url: portal.url });
}
