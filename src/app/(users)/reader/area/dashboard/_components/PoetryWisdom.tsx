import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export default async function PoetryWisdomProgress() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="mt-4">Você precisa estar logado para acessar o Dashboard Bíblico.</p>
      </div>
    );
  }

  // Descobre o plano do usuário (ajuste conforme sua regra)
  const anyProgress = await db.userReadingProgress.findFirst({
    where: { userId: session.user.id },
    select: { planId: true },
  });
  const fallbackPlan = await db.bibleReadingPlan.findFirst({ select: { id: true } });
  const planId = anyProgress?.planId ?? fallbackPlan?.id;
  if (!planId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard Bíblico</h1>
        <p className="mt-2">Nenhum plano de leitura encontrado.</p>
      </div>
    );
  }

  // Helper para montar OR de 'contains' insensível
  const containsAny = (...names: string[]) =>
    names.map((n) => ({ passages: { contains: n, mode: "insensitive" as const } }));

  // Livros Poéticos/Sabedoria
  const poetryOR = [
    ...containsAny("Salmos"),
    ...containsAny("Provérbios", "Proverbios"),
    ...containsAny("Eclesiastes"),
    ...containsAny("Cântico dos Cânticos", "Cantico dos Canticos", "Cânticos", "Canticos", "Cantares"),
  ];

  // Dias do plano pertencentes a Poéticos/Sabedoria
  const poetryDayIds = await db.readingDay.findMany({
    where: { planId, OR: poetryOR },
    select: { id: true },
  });
  const poetryIds = poetryDayIds.map((d) => d.id);
  const poetryTotal = poetryIds.length;

  // Quantos desses dias o usuário completou?
  const poetryCompleted = await db.userReadingProgress.count({
    where: {
      userId: session.user.id,
      planId,
      completed: true,
      dayId: { in: poetryIds },
    },
  });

  const poetryPct = poetryTotal === 0 ? 0 : Math.round((poetryCompleted / poetryTotal) * 100);

  // “Dias finais” (usei as variantes para evitar problemas de acentuação/nomenclatura)
  const lastMarkers = [
    "Salmos 148-150",
    "Provérbios 31",
    "Proverbios 31",
    "Eclesiastes 9-12",
    "Cântico dos Cânticos 8",
    "Cantico dos Canticos 8",
    "Cânticos 8",
    "Canticos 8",
    "Cantares 8",
  ];

  const lastDayIds = await db.readingDay.findMany({
    where: {
      planId,
      OR: lastMarkers.map((m) => ({ passages: { contains: m, mode: "insensitive" as const } })),
    },
    select: { id: true },
  });

  const finishedMarkersCount = await db.userReadingProgress.count({
    where: {
      userId: session.user.id,
      planId,
      completed: true,
      dayId: { in: lastDayIds.map((d) => d.id) },
    },
  });

  // Usa a quantidade real de “dias finais” encontrados (evita duplicidade)
  const requiredLastDayCount = lastDayIds.length;

  const poetryFinished = poetryTotal > 0 && poetryCompleted === poetryTotal;
  const poetryFinishedByMarkers =
    requiredLastDayCount > 0 && finishedMarkersCount === requiredLastDayCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso de Leitura - Poéticos e Sabedoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-2">
              <p>Salmos, Provérbios, Eclesiastes, Cântico dos Cânticos</p>
            </div>
            <Badge>{poetryPct}%</Badge>
          </div>
          <Progress value={poetryPct} />
          {poetryFinished && (
            <p className="text-green-600 font-medium">POÉTICOS E SABEDORIA FINALIZADOS</p>
          )}
          {!poetryFinished && poetryFinishedByMarkers && (
            <p className="text-amber-600">
              “Dias finais” concluídos, mas ainda há leituras de Poéticos/Sabedoria pendentes.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
