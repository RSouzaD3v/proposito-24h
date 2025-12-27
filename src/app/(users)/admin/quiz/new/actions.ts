"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/* =========================
 * SCHEMA
 * ========================= */
const createQuizSchema = z.object({
  title: z.string().min(3, "Título muito curto"),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  active: z.boolean().default(true),
  timeLimit: z.number().int().positive().optional(),
  pointsPerHit: z.number().int().positive().default(10),
});

/* =========================
 * ACTION
 * ========================= */
export async function createQuizAction(
  data: z.infer<typeof createQuizSchema>
) {
  const session = await getServerSession(authOptions);

  // 🔒 Apenas ADMIN
  if (!session || session.user.role !== "ADMIN") {
    return {
      success: false,
      message: "Não autorizado",
    };
  }

  const parsed = createQuizSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    const quiz = await db.quiz.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        coverUrl: parsed.data.coverUrl,
        active: parsed.data.active,
        timeLimit: parsed.data.timeLimit,
        pointsPerHit: parsed.data.pointsPerHit,
      },
      select: {
        id: true,
      },
    });

    // 🔄 Revalida listagem
    revalidatePath("/admin/quiz", "page");

    return {
      success: true,
      quizId: quiz.id,
    };
  } catch (error) {
    console.error("createQuizAction error:", error);

    return {
      success: false,
      message: "Erro ao criar quiz",
    };
  }
}
