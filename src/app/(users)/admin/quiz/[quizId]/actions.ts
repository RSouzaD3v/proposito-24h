"use server";

import { apiSend } from "@/lib/api/server";
import { revalidatePath } from "next/cache";

export async function updateQuizQuestionAction(data: {
  quizId: string;
  questionId: string;
  title: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}) {
  const { quizId, questionId, ...body } = data;
  const result = await apiSend("PUT", `/admin/quizzes/${quizId}/questions/${questionId}`, body);
  if (!result.ok) return { success: false, message: result.message ?? "Dados inválidos" };

  revalidatePath(`/admin/quiz/${quizId}`, "page");
  return { success: true };
}

export async function deleteQuizQuestionAction(quizId: string, questionId: string) {
  await apiSend("DELETE", `/admin/quizzes/${quizId}/questions/${questionId}`);
  revalidatePath(`/admin/quiz/${quizId}`);
}
