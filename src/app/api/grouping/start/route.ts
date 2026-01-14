import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupingDailyId } = await req.json();

  if (!groupingDailyId) {
    return NextResponse.json(
      { error: "groupingDailyId is required" },
      { status: 400 }
    );
  }

  // 🔹 Finaliza qualquer grouping ativo
  await db.userGroupingDaily.updateMany({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  // 🔹 Cria novo grouping
  const userGrouping = await db.userGroupingDaily.create({
    data: {
      userId: session.user.id,
      groupingDailyId,
      startAt: new Date(),
      status: "ACTIVE",
    },
  });

  return NextResponse.json({ success: true, userGrouping });
}
