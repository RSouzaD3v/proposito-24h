import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subs = await db.readerSubscription.findMany({
    where: { readerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      writerId: true,
      status: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      stripeSubscriptionId: true,
      writer: { select: { id: true, name: true, slug: true, logoUrl: true } },
      priceId: true,
    },
  });

  return NextResponse.json(subs);
}
