"use server";

import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/authOption";

interface CompleteLevelInput {
  playerGameId: string;
  levelId: string;
  foundWords: string[];
  score?: number;
  timeSpent?: number;
}

export async function completeLevel(data: CompleteLevelInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { playerGameId, levelId, foundWords, score = 0, timeSpent = 0 } = data;

  // cria ou atualiza progresso do nível
  await db.playerLevelProgress.upsert({
    where: {
      playerGameId_levelId: {
        playerGameId,
        levelId,
      },
    },
    update: {
      completed: true,
      foundWords,
      score,
      timeSpent,
    },
    create: {
      playerGameId,
      levelId,
      completed: true,
      foundWords,
      score,
      timeSpent,
    },
  });

  // busca PlayerGame atual
  const playerGame = await db.playerGame.findUnique({
    where: { id: playerGameId },
  });

  if (!playerGame) return;

  // avança nível + recompensa
  await db.playerGame.update({
    where: { id: playerGameId },
    data: {
      currentLevel: playerGame.currentLevel + 1,
      coins: { increment: 10 }, // recompensa base
    },
  });

  revalidatePath(`/reader/area/game`);
}
