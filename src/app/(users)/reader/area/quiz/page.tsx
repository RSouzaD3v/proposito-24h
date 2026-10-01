import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";

export default async function ReaderQuizPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <p className="text-sm text-[var(--liquid-muted)] text-center mt-10 px-4">
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
      <div className="max-w-xl mx-auto px-4 py-10 text-center space-y-4">
        <PageHeader title="Quizzes Bíblicos" backHref="/reader/area/games" />
        <GlassCard strong className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--liquid-ink)]">
            Nenhum quiz disponível
          </h2>
          <p className="text-sm text-[var(--liquid-muted)]">
            Em breve novos quizzes estarão disponíveis para você.
          </p>
          <Button asChild variant="glass" className="rounded-full">
            <Link href="/reader/area/games">Voltar</Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title="Quizzes Bíblicos"
        description="Teste seus conhecimentos e acompanhe sua evolução"
        backHref="/reader/area/games"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <GlassCard key={quiz.id} strong padding="none" className="overflow-hidden flex flex-col">
            {quiz.coverUrl && (
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={quiz.coverUrl}
                  alt={quiz.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-1 flex-col gap-3 p-4">
              <h2 className="font-semibold text-base text-[var(--liquid-ink)]">
                {quiz.title}
              </h2>

              {quiz.description && (
                <p className="text-sm text-[var(--liquid-muted)] line-clamp-3">
                  {quiz.description}
                </p>
              )}

              <div className="text-xs text-[var(--liquid-muted)] flex justify-between">
                {quiz.timeLimit && <span>⏱ {quiz.timeLimit}s</span>}
                <span>⭐ {quiz.pointsPerHit} pts</span>
              </div>

              <Button asChild variant="glass-primary" className="w-full mt-auto rounded-full">
                <Link href={`/reader/area/quiz/${quiz.id}`}>Jogar agora</Link>
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
