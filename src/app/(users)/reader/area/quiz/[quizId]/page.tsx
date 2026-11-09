import { apiPostOrNull } from "@/lib/api/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
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

  const opened = await apiPostOrNull<any>(`/reader/quizzes/${quizId}/session`);
  if (!opened) notFound();

  /**
   * 4) Se já finalizou, bloqueia replay
   */
  if (opened.completed) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-4">

        <h1 className="text-2xl font-bold">
          Quiz finalizado 🎉
        </h1>

        <p className="text-muted-foreground">
          Você já concluiu este quiz.
        </p>

        <p className="text-lg font-semibold">
          Pontuação final: {opened.score}
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
      quiz={opened.quiz}
      questions={opened.questions}
      session={{
        score: opened.score,
        answeredIds: opened.answeredQuestionIds,
      }}
    />
  );
}
