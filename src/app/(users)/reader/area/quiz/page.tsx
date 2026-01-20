import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ReaderQuizPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <p className="text-sm text-muted-foreground text-center mt-10">
        Você precisa estar logado para acessar os quizzes.
      </p>
    );
  }

  /**
   * 🔹 Buscar quizzes ativos da aplicação
   */
  const quizzes = await db.quiz.findMany({
    where: {
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      coverUrl: true,
      timeLimit: true,
      pointsPerHit: true,
    },
  });

  if (quizzes.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center space-y-4">
        <h1 className="text-xl font-semibold">
          Nenhum quiz disponível
        </h1>
        <p className="text-sm text-muted-foreground">
          Em breve novos quizzes estarão disponíveis para você.
        </p>

        <Button asChild variant="outline">
          <Link href="/reader/area/games">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-6 px-3 space-y-6">
        <Link href={"/reader/area/games"}>
            <Button className="cursor-pointer my-2">
                Voltar para games
            </Button>
        </Link>
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">
          Quizzes Bíblicos
        </h1>
        <p className="text-sm text-muted-foreground">
          Teste seus conhecimentos e acompanhe sua evolução
        </p>
      </div>

      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className="overflow-hidden hover:shadow-md transition"
          >
            {/* CAPA */}
            {quiz.coverUrl && (
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={quiz.coverUrl}
                  alt={quiz.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <CardContent className="p-4 space-y-3">
              <h2 className="font-semibold text-base">
                {quiz.title}
              </h2>

              {quiz.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {quiz.description}
                </p>
              )}

              {/* INFO */}
              <div className="text-xs text-muted-foreground flex justify-between">
                {quiz.timeLimit && (
                  <span>⏱ {quiz.timeLimit}s</span>
                )}
                <span>⭐ {quiz.pointsPerHit} pts</span>
              </div>

              <Button asChild className="w-full mt-2">
                <Link href={`/reader/area/quiz/${quiz.id}`}>
                  Jogar agora
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
