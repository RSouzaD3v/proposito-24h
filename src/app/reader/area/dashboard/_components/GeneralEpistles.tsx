import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export default async function GeneralEpistlesProgress() {
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

  // Helper para OR de 'contains' insensível
  const containsAny = (...names: string[]) =>
    names.map((n) => ({ passages: { contains: n, mode: "insensitive" as const } }));

  // Cartas Gerais: Hebreus, Tiago, 1–2 Pedro, 1–3 João, Judas
  const generalOR = [
    ...containsAny("Hebreus"),
    ...containsAny("Tiago"),
    ...containsAny("1 Pedro"),
    ...containsAny("2 Pedro"),
    ...containsAny("1 João", "1 Joao"),
    ...containsAny("2 João", "2 Joao"),
    ...containsAny("3 João", "3 Joao"),
    ...containsAny("Judas"),
  ];

  // Dias do plano pertencentes às Cartas Gerais
  const generalDayIds = await db.readingDay.findMany({
    where: { planId, OR: generalOR },
    select: { id: true },
  });
  const generalIds = generalDayIds.map((d) => d.id);
  const generalTotal = generalIds.length;

  // Quantos desses dias o usuário completou?
  const generalCompleted = await db.userReadingProgress.count({
    where: {
      userId: session.user.id,
      planId,
      completed: true,
      dayId: { in: generalIds },
    },
  });

  const generalPct = generalTotal === 0 ? 0 : Math.round((generalCompleted / generalTotal) * 100);

  // “Dias finais” (com variantes para João)
  const lastMarkers = [
    "Hebreus 13",
    "Tiago 5",
    "1 Pedro 5",
    "2 Pedro 1-3",
    "1 João 5", "1 Joao 5",
    "2 João 1", "2 Joao 1",
    "3 João 1", "3 Joao 1",
    "Judas 1",
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

  // Usa a quantidade real de “dias finais” encontrados
  const requiredLastDayCount = lastDayIds.length;

  const generalFinished = generalTotal > 0 && generalCompleted === generalTotal;
  const generalFinishedByMarkers =
    requiredLastDayCount > 0 && finishedMarkersCount === requiredLastDayCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso de Leitura — Cartas Gerais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-2">
              <p>Hebreus, Tiago, 1–2 Pedro, 1–3 João, Judas</p>
            </div>
            <Badge>{generalPct}%</Badge>
          </div>
          <Progress value={generalPct} />
          {generalFinished && (
            <p className="text-green-600 font-medium">CARTAS GERAIS FINALIZADAS</p>
          )}
          {!generalFinished && generalFinishedByMarkers && (
            <p className="text-amber-600">
              “Dias finais” concluídos, mas ainda há leituras pendentes neste bloco.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
