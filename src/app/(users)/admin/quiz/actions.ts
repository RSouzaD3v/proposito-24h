"use server";

import { apiSend } from "@/lib/api/server";
import { revalidatePath } from "next/cache";

export async function createQuizQuestionAction(data: {
  quizId: string;
  title: string;
  options: { text: string; isCorrect: boolean }[];
}) {
  const { quizId, ...body } = data;
  const result = await apiSend("POST", `/admin/quizzes/${quizId}/questions`, body);
  if (!result.ok) return { success: false, message: result.message ?? "Dados inválidos" };

  revalidatePath(`/admin/quiz/${quizId}`);
  return { success: true };
}
