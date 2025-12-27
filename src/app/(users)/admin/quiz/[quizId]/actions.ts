"use server"

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import z from "zod";

const updateQuestionSchema = z.object({
  quizId: z.string(),
  questionId: z.string(),
  title: z.string().min(3),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string().min(1),
      isCorrect: z.boolean(),
    })
  ),
});

export async function updateQuizQuestionAction(
  data: z.infer<typeof updateQuestionSchema>
) {
  const parsed = updateQuestionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Dados inválidos" };
  }

  const { quizId, questionId, title, options } = parsed.data;

  // garante apenas 1 correta
  if (options.filter((o) => o.isCorrect).length !== 1) {
    return {
      success: false,
      message: "Marque exatamente uma alternativa correta",
    };
  }

  await db.quizQuestion.update({
    where: { id: questionId },
    data: {
      title,
      options: {
        update: options.map((opt) => ({
          where: { id: opt.id },
          data: {
            text: opt.text,
            isCorrect: opt.isCorrect,
          },
        })),
      },
    },
  });

  revalidatePath(`/admin/quiz/${quizId}`, "page");

  return { success: true };
}


export async function deleteQuizQuestionAction(
  quizId: string,
  questionId: string
) {
  await db.quizQuestion.delete({
    where: { id: questionId },
  });

  revalidatePath(`/admin/quiz/${quizId}`);
}
