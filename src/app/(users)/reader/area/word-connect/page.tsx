import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/authOption";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";

export default async function GameAreaPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const games = await db.gameTemplate.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
    include: {
      playerGames: {
        where: { userId },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <PageHeader
        title="Área de Jogos"
        description="Jogue, avance de nível e ganhe recompensas"
        backHref="/reader/area/games"
      />

      {games.length === 0 && (
        <GlassCard strong className="p-8 text-center">
          <h2 className="text-lg font-semibold text-[var(--liquid-ink)]">
            Nenhum jogo disponível
          </h2>
          <p className="text-sm text-[var(--liquid-muted)] mt-2">
            Em breve novos jogos estarão disponíveis para você.
          </p>
        </GlassCard>
      )}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const playerGame = game.playerGames?.[0];

          const statusLabel = playerGame
            ? playerGame.completed
              ? "Concluído"
              : "Em progresso"
            : "Novo";

          return (
            <GlassCard key={game.id} strong className="flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-[var(--liquid-ink)]">
                    {game.title}
                  </h3>
                  <Badge variant="secondary">{statusLabel}</Badge>
                </div>

                {game.description && (
                  <p className="text-sm text-[var(--liquid-muted)]">
                    {game.description}
                  </p>
                )}

                {playerGame && (
                  <div className="text-sm space-y-1 text-[var(--liquid-ink)]">
                    <p>
                      <strong>Nível atual:</strong> {playerGame.currentLevel}
                    </p>
                    <p>
                      <strong>Moedas:</strong> {playerGame.coins}
                    </p>
                  </div>
                )}
              </div>

              <Button asChild variant="glass-primary" className="w-full rounded-full">
                <Link href={`/reader/area/game/${game.slug}/play`}>
                  {playerGame ? "Continuar" : "Começar"}
                </Link>
              </Button>
            </GlassCard>
          );
        })}
      </section>
    </div>
  );
}
