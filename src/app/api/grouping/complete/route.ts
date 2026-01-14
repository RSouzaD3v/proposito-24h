import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userGrouping = await db.userGroupingDaily.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
  });

  if (!userGrouping) {
    return NextResponse.json(
      { error: "No active grouping" },
      { status: 400 }
    );
  }

  await db.userGroupingDaily.update({
    where: { id: userGrouping.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
