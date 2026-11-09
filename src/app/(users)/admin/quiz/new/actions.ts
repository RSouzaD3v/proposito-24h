"use server";

import { apiSend } from "@/lib/api/server";
import { revalidatePath } from "next/cache";

export async function createQuizAction(data: {
  title: string;
  description?: string;
  coverUrl?: string;
  active?: boolean;
  timeLimit?: number;
  pointsPerHit?: number;
}) {
  const result = await apiSend("POST", "/admin/quizzes", data);
  if (!result.ok) return { success: false, message: result.message ?? "Erro ao criar quiz" };

  revalidatePath("/admin/quiz", "page");
  return { success: true, quizId: (result.data as { id: string }).id };
}
