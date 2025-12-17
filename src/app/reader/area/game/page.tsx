import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/authOption";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
        <Link href={"/reader/area"} className="bg-black hover:bg-gray-800 text-white p-2 rounded-sm">
            Voltar para area
        </Link>
      {/* Header */}
      <header className="space-y-2 mt-5">
        <h1 className="text-3xl font-bold">Área de Jogos</h1>
        <p className="text-muted-foreground">
          Jogue, avance de nível e ganhe recompensas
        </p>
      </header>

      {/* Empty state */}
      {games.length === 0 && (
        <Card className="p-8 text-center">
          <h2 className="text-lg font-semibold">Nenhum jogo disponível</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Em breve novos jogos estarão disponíveis para você.
          </p>
        </Card>
      )}

      {/* Games */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const playerGame = game.playerGames?.[0];

          const statusLabel = playerGame
            ? playerGame.completed
              ? "Concluído"
              : "Em progresso"
            : "Novo";

          const statusVariant = playerGame
            ? playerGame.completed
              ? "success"
              : "outline"
            : "secondary";

          return (
            <Card key={game.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {game.title}
                  <Badge>{statusLabel}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {game.description && (
                  <p className="text-sm text-muted-foreground">
                    {game.description}
                  </p>
                )}

                {playerGame && (
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Nível atual:</strong> {playerGame.currentLevel}
                    </p>
                    <p>
                      <strong>Moedas:</strong> {playerGame.coins}
                    </p>
                  </div>
                )}

                <Button asChild className="w-full">
                  <Link href={`/reader/area/game/${game.slug}/play`}>
                    {playerGame ? "Continuar" : "Começar"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
