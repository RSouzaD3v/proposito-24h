import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/authOption";

import WordConnectPlay from "./_components/WordConnectPlay";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

function parseLayout(layout: unknown): { x: number; y: number }[] {
  if (!Array.isArray(layout)) return [];

  return layout.filter(
    (p): p is { x: number; y: number } =>
      typeof p === "object" &&
      p !== null &&
      "x" in p &&
      "y" in p &&
      typeof (p as any).x === "number" &&
      typeof (p as any).y === "number"
  );
}

export default async function GamePlayPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const { slug } = await params;

  const game = await db.gameTemplate.findUnique({
    where: { slug },
    include: {
      levels: {
        orderBy: { order: "asc" },
        include: {
          words: true,
        },
      },
    },
  });

  if (!game || !game.active) {
    notFound();
  }

  let playerGame = await db.playerGame.findUnique({
    where: {
      userId_gameTemplateId: {
        userId,
        gameTemplateId: game.id,
      },
    },
  });

  if (!playerGame) {
    playerGame = await db.playerGame.create({
      data: {
        userId,
        gameTemplateId: game.id,
      },
    });
  }

  const level = game.levels.find(
    (l) => l.order === playerGame.currentLevel
  );

  if (!level) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Parabéns 🎉</h1>
          <p className="text-muted-foreground">
            Você concluiu todos os níveis deste jogo.
          </p>
        </div>
      </div>
    );
  }

  const layout = parseLayout(level.layout);

  return (
    <WordConnectPlay
      gameId={game.id}
      levelId={level.id}
      letters={level.letters}
      layout={layout}
      words={level.words.map((w) => ({
        word: w.word,
        bonus: w.bonus,
      }))}
      playerGameId={playerGame.id}
      currentLevel={level.order}
      coins={playerGame.coins}
    />
  );
}
