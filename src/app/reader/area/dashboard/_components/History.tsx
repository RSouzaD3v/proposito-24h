import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export default async function HistoryProgress() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="mt-4">Você precisa estar logado para acessar o Dashboard Bíblico.</p>
      </div>
    );
  }

  // Descobre o plano do usuário (ajuste conforme sua regra de plano ativo)
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

  // Util para gerar OR de contains insensível
  const containsAny = (...names: string[]) =>
    names.map((n) => ({ passages: { contains: n, mode: "insensitive" as const } }));

  // Livros Históricos (conforme seu recorte: Juízes → Ester)
  const historicalOR = [
    ...containsAny("Juízes", "Juizes"),
    ...containsAny("Rute"),
    ...containsAny("1 Samuel"),
    ...containsAny("2 Samuel"),
    ...containsAny("1 Reis"),
    ...containsAny("2 Reis"),
    ...containsAny("1 Crônicas", "1 Cronicas"),
    ...containsAny("2 Crônicas", "2 Cronicas"),
    ...containsAny("Esdras"),
    ...containsAny("Neemias"),
    ...containsAny("Ester"),
  ];

  // Dias do plano que pertencem aos Históricos
  const historicalDayIds = await db.readingDay.findMany({
    where: { planId, OR: historicalOR },
    select: { id: true },
  });
  const historicalIds = historicalDayIds.map((d) => d.id);
  const historicalTotal = historicalIds.length;

  // Quantos desses dias o usuário completou?
  const historicalCompleted = await db.userReadingProgress.count({
    where: {
      userId: session.user.id,
      planId,
      completed: true,
      dayId: { in: historicalIds },
    },
  });

  const historicalPct =
    historicalTotal === 0 ? 0 : Math.round((historicalCompleted / historicalTotal) * 100);

  // "Dias finais" exatos conforme o seu DB (com variantes sem acento onde necessário)
  const lastMarkers = [
    "Juízes 19-21",
    "Juizes 19-21",
    "Rute 4",
    "1 Samuel 30-31",
    "2 Samuel 22-24",
    "1 Reis 21-22",
    "2 Reis 22-25",
    "1 Crônicas 27-29",
    "1 Cronicas 27-29",
    "2 Crônicas 34-36",
    "2 Cronicas 34-36",
    "Esdras 8-10",
    "Neemias 12-13",
    "Ester 8-10",
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

  // Use a contagem real de dias finais encontrados (evita duplicidade por variantes)
  const requiredLastDayCount = lastDayIds.length;

  const historicalFinished = historicalTotal > 0 && historicalCompleted === historicalTotal;
  const historicalFinishedByMarkers =
    requiredLastDayCount > 0 && finishedMarkersCount === requiredLastDayCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso de Leitura - Históricos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-2">
              <p>Juízes, Rute, 1–2 Samuel, 1–2 Reis, 1–2 Crônicas, Esdras, Neemias, Ester</p>
            </div>
            <Badge>{historicalPct}%</Badge>
          </div>
          <Progress value={historicalPct} />
          {historicalFinished && (
            <p className="text-green-600 font-medium">LIVROS HISTÓRICOS FINALIZADOS</p>
          )}
          {!historicalFinished && historicalFinishedByMarkers && (
            <p className="text-amber-600">
              “Dias finais” concluídos, mas ainda há leituras dos Históricos pendentes.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
