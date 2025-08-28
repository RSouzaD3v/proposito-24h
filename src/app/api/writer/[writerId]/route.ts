import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ writerId: string }> }
) {
  const { writerId } = await params;

  const plans = await db.writerSubscriptionPlan.findMany({
    where: { writerId, isActive: true },
    orderBy: [{ amountCents: "asc" }],
    select: {
      id: true,
      stripeProductId: true,
      stripePriceId: true,
      interval: true,
      amountCents: true,
      currency: true,
      trialDays: true,
      applicationFeePct: true,
      isActive: true,
    },
  });

  return NextResponse.json(plans);
}
