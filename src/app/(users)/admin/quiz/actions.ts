"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import z from "zod";

const createQuestionSchema = z.object({
  quizId: z.string(),
  title: z.string().min(3),
  options: z
    .array(
      z.object({
        text: z.string().min(1),
        isCorrect: z.boolean(),
      })
    )
    .min(2),
});

export async function createQuizQuestionAction(
  data: z.infer<typeof createQuestionSchema>
) {
  const parsed = createQuestionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Dados inválidos" };
  }

  const { quizId, title, options } = parsed.data;

  if (!options.some((o) => o.isCorrect)) {
    return {
      success: false,
      message: "Marque uma alternativa correta",
    };
  }

  const order =
    (await db.quizQuestion.count({ where: { quizId } })) + 1;

  await db.quizQuestion.create({
    data: {
      quizId,
      title,
      order,
      options: {
        create: options,
      },
    },
  });

  revalidatePath(`/admin/quiz/${quizId}`);

  return { success: true };
}
