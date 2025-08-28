import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ writerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { writerId } = await params;
  const sub = await db.readerSubscription.findUnique({
    where: { reader_writer_unique: { readerId: session.user.id, writerId } },
  });

  if (!sub?.stripeSubscriptionId) {
    return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 });
  }

  const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await db.readerSubscription.update({
    where: { id: sub.id },
    data: {
      status: (updated.status || "canceled").toUpperCase() as any,
      cancelAt: updated.cancel_at ? new Date(updated.cancel_at * 1000) : new Date(),
      cancelAtPeriodEnd: !!updated.cancel_at_period_end,
      currentPeriodStart: new Date(updated.start_date * 1000),
      currentPeriodEnd: new Date((updated.ended_at ?? 0) * 1000),
    },
  });

  return NextResponse.json({ ok: true });
}
