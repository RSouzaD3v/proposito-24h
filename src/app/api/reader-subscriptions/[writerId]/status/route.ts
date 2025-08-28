import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

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
  });

  if (!sub) {
    return NextResponse.json({
      exists: false,
      isActive: false,
      status: null,
    });
  }

  const now = new Date();
  const isActive =
    (sub.status === "ACTIVE" || sub.status === "TRIALING") &&
    (!!sub.currentPeriodEnd ? sub.currentPeriodEnd > now : true);

  return NextResponse.json({
    exists: true,
    isActive,
    status: sub.status,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    latestInvoiceId: sub.latestInvoiceId ?? null,
    stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
  });
}
