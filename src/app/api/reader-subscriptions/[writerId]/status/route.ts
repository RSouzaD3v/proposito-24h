import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { subscriptionSummary } from "@/lib/readerSubscription";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ writerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { writerId } = await params;

  const sub = await db.readerSubscription.findUnique({
    where: { reader_writer_unique: { readerId: session.user.id, writerId } },
    include: {
      writer: { select: { name: true, slug: true, logoUrl: true } },
    },
  });

  if (!sub) {
    return NextResponse.json({
      exists: false,
      isActive: false,
      status: null,
    });
  }

  const summary = subscriptionSummary(sub);
  const plan = await db.writerSubscriptionPlan.findUnique({
    where: { id: sub.priceId },
    select: { trialDays: true, amountCents: true, currency: true, interval: true },
  });

  return NextResponse.json({
    exists: true,
    status: sub.status,
    lifetime: sub.lifetime,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    cancelAt: sub.cancelAt,
    latestInvoiceId: sub.latestInvoiceId ?? null,
    asaasSubscriptionId: sub.asaasSubscriptionId ?? null,
    writer: sub.writer,
    plan,
    ...summary,
  });
}
