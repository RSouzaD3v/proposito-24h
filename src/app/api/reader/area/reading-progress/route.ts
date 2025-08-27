import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planId, dayId, completed } = await req.json();

    if (!planId || !dayId || typeof completed !== "boolean") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    if (completed) {
      // Marca como concluído (upsert)
      const res = await db.userReadingProgress.upsert({
        where: { userId_planId_dayId: { 
          userId: session.user.id, planId, dayId 
        }},
        update: { completed: true, completedAt: new Date() },
        create: {
          userId: session.user.id,
          planId,
          dayId,
          completed: true,
          completedAt: new Date(),
        },
      });
      return NextResponse.json({ ok: true, progressId: res.id });
    } else {
      // Desmarca (remove o registro para economizar espaço)
      await db.userReadingProgress.delete({
        where: { userId_planId_dayId: { 
          userId: session.user.id, planId, dayId 
        }},
      }).catch(() => {}); // se não existir, ignora
      return NextResponse.json({ ok: true });
    }
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
