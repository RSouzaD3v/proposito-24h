"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import z from "zod";

/* =========================
 * SCHEMA
 * ========================= */
const submitQuizAnswerSchema = z.object({
  sessionId: z.string(),
  quizId: z.string(),
  questionId: z.string(),
  optionId: z.string(),
});

/* =========================
 * ACTION
 * ========================= */
export async function submitQuizAnswerAction(
  input: z.infer<typeof submitQuizAnswerSchema>
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, message: "Não autorizado" };
  }

  const parsed = submitQuizAnswerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Dados inválidos" };
  }

  const { sessionId, quizId, questionId, optionId } = parsed.data;

  /**
   * 1️⃣ Buscar sessão do quiz
   */
  const quizSession = await db.quizSession.findFirst({
    where: {
      id: sessionId,
      quizId,
      userId: session.user.id,
      completed: false,
    },
    include: {
      answers: true,
      quiz: true,
    },
  });

  if (!quizSession) {
    return {
      success: false,
      message: "Sessão de quiz inválida",
    };
  }

  /**
   * 2️⃣ Impedir resposta duplicada
   */
  const alreadyAnswered = quizSession.answers.some(
    (a) => a.questionId === questionId
  );

  if (alreadyAnswered) {
    return {
      success: false,
      message: "Pergunta já respondida",
    };
  }

  /**
   * 3️⃣ Buscar alternativa correta
   */
  const option = await db.quizOption.findFirst({
    where: {
      id: optionId,
      questionId,
    },
  });

  if (!option) {
    return {
      success: false,
      message: "Alternativa inválida",
    };
  }

  const isCorrect = option.isCorrect;

  /**
   * 4️⃣ Criar resposta
   */
  await db.quizAnswer.create({
    data: {
      sessionId,
      questionId,
      optionId,
      isCorrect,
    },
  });

  /**
   * 5️⃣ Atualizar pontuação
   */
  if (isCorrect) {
    await db.quizSession.update({
      where: { id: sessionId },
      data: {
        score: {
          increment: quizSession.quiz.pointsPerHit,
        },
      },
    });
  }

  /**
   * 6️⃣ Verificar finalização
   */
  const totalQuestions = await db.quizQuestion.count({
    where: { quizId },
  });

  const answeredCount = quizSession.answers.length + 1;

  if (answeredCount >= totalQuestions) {
    await db.quizSession.update({
      where: { id: sessionId },
      data: {
        completed: true,
        endedAt: new Date(),
      },
    });
  }

  /**
   * 7️⃣ Revalidar UI
   */
  revalidatePath(`/reader/area/quiz/${quizId}`);

  return {
    success: true,
    correct: isCorrect,
  };
}
