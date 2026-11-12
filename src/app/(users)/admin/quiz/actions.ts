"use server";

import { revalidatePath } from "next/cache";
import { apiSend } from "@/lib/api/server";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; message: string };

export type QuizInput = {
  title: string;
  description: string;
  coverUrl: string;
  active: boolean;
  timeLimit: number | null;
  pointsPerHit: number;
};

export type QuestionInput = { title: string; options: { id?: string; text: string; isCorrect: boolean }[] };

const fail = (message: string | undefined, fallback: string): ActionResult<never> => ({ ok: false, message: message ?? fallback });

export async function createQuizAction(input: QuizInput): Promise<ActionResult<{ id: string }>> {
  const { timeLimit, description, coverUrl, ...rest } = input;
  const result = await apiSend("POST", "/admin/quizzes", {
    ...rest,
    ...(description.trim() ? { description: description.trim() } : {}),
    ...(coverUrl.trim() ? { coverUrl: coverUrl.trim() } : {}),
    ...(timeLimit ? { timeLimit } : {}),
  });
  if (!result.ok) return fail(result.message, "Não foi possível criar o quiz.");
  revalidatePath("/admin/quiz");
  return { ok: true, data: result.data as { id: string } };
}

export async function updateQuizAction(id: string, input: Partial<QuizInput>): Promise<ActionResult> {
  const result = await apiSend("PUT", `/admin/quizzes/${id}`, input);
  if (!result.ok) return fail(result.message, "Não foi possível salvar o quiz.");
  revalidatePath("/admin/quiz");
  revalidatePath(`/admin/quiz/${id}`);
  return { ok: true };
}

export async function createQuestionAction(quizId: string, input: QuestionInput): Promise<ActionResult> {
  const result = await apiSend("POST", `/admin/quizzes/${quizId}/questions`, {
    title: input.title,
    options: input.options.map(({ text, isCorrect }) => ({ text, isCorrect })),
  });
  if (!result.ok) return fail(result.message, "Não foi possível criar a pergunta.");
  revalidatePath(`/admin/quiz/${quizId}`);
  revalidatePath("/admin/quiz");
  return { ok: true };
}

export async function updateQuestionAction(quizId: string, questionId: string, input: QuestionInput): Promise<ActionResult> {
  const result = await apiSend("PUT", `/admin/quizzes/${quizId}/questions/${questionId}`, input);
  if (!result.ok) return fail(result.message, "Não foi possível salvar a pergunta.");
  revalidatePath(`/admin/quiz/${quizId}`);
  return { ok: true };
}

export async function deleteQuestionAction(quizId: string, questionId: string): Promise<ActionResult> {
  const result = await apiSend("DELETE", `/admin/quizzes/${quizId}/questions/${questionId}`);
  if (!result.ok) return fail(result.message, "Não foi possível excluir a pergunta.");
  revalidatePath(`/admin/quiz/${quizId}`);
  revalidatePath("/admin/quiz");
  return { ok: true };
}
