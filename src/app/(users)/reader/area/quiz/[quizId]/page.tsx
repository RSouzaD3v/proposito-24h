import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuizPlayer } from "./_components/QuizPlayer";

interface PageProps {
  params: Promise<{ quizId: string }>;
}

export default async function ReaderQuizPlayPage({
  params,
}: PageProps) {
  const { quizId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <p className="text-sm text-muted-foreground text-center mt-10">
        Você precisa estar logado para jogar.
      </p>
    );
  }

  /**
   * 1) Buscar quiz ativo
   */
  const quiz = await db.quiz.findFirst({
    where: {
      id: quizId,
      active: true,
    },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) notFound();

  /**
   * 2) Buscar sessão existente (COMPLETA OU NÃO)
   */
  let sessionQuiz = await db.quizSession.findFirst({
    where: {
      quizId: quiz.id,
      userId: session.user.id,
    },
    include: {
      answers: true,
    },
  });

  /**
   * 3) Se não existir, cria
   */
  if (!sessionQuiz) {
    sessionQuiz = await db.quizSession.create({
      data: {
        quizId: quiz.id,
        userId: session.user.id,
      },
      include: {
        answers: true,
      },
    });
  }

  /**
   * 4) Se já finalizou, bloqueia replay
   */
  if (sessionQuiz.completed) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-4">

        <h1 className="text-2xl font-bold">
          Quiz finalizado 🎉
        </h1>

        <p className="text-muted-foreground">
          Você já concluiu este quiz.
        </p>

        <p className="text-lg font-semibold">
          Pontuação final: {sessionQuiz.score}
        </p>

        <Link href="/reader/area/quiz">
          <Button>Voltar aos quizzes</Button>
        </Link>
      </div>
    );
  }

  /**
   * 5) Quiz em andamento
   */
  return (
    <QuizPlayer
      quiz={{
        id: quiz.id,
        title: quiz.title,
        pointsPerHit: quiz.pointsPerHit,
      }}
      questions={quiz.questions}
      session={{
        id: sessionQuiz.id,
        score: sessionQuiz.score,
        answeredIds: sessionQuiz.answers.map(
          (a) => a.questionId
        ),
      }}
    />
  );
}
