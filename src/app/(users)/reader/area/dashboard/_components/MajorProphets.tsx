import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export default async function MajorProphetsProgress() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="mt-4">Você precisa estar logado para acessar o Dashboard Bíblico.</p>
      </div>
    );
  }

  // Descobre o plano do usuário (ajuste conforme a sua regra)
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

  // Profetas Maiores: Isaías, Jeremias, Lamentações, Ezequiel, Daniel
  const majorOR = [
    ...containsAny("Isaías", "Isaias"),
    ...containsAny("Jeremias"),
    ...containsAny("Lamentações", "Lamentacoes"),
    ...containsAny("Ezequiel"),
    ...containsAny("Daniel"),
  ];

  // Dias do plano pertencentes aos Profetas Maiores
  const majorDayIds = await db.readingDay.findMany({
    where: { planId, OR: majorOR },
    select: { id: true },
  });
  const majorIds = majorDayIds.map((d) => d.id);
  const majorTotal = majorIds.length;

  // Quantos desses dias o usuário completou?
  const majorCompleted = await db.userReadingProgress.count({
    where: {
      userId: session.user.id,
      planId,
      completed: true,
      dayId: { in: majorIds },
    },
  });

  const majorPct = majorTotal === 0 ? 0 : Math.round((majorCompleted / majorTotal) * 100);

  // “Dias finais” (com variantes para acentuação)
  const lastMarkers = [
    "Isaías 66",
    "Isaias 66",
    "Jeremias 52",
    "Lamentações 5",
    "Lamentacoes 5",
    "Ezequiel 48",
    "Daniel 9-12",
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

  const requiredLastDayCount = lastDayIds.length;

  const majorFinished = majorTotal > 0 && majorCompleted === majorTotal;
  const majorFinishedByMarkers =
    requiredLastDayCount > 0 && finishedMarkersCount === requiredLastDayCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso de Leitura - Profetas Maiores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-2">
              <p>Isaías, Jeremias, Lamentações, Ezequiel, Daniel</p>
            </div>
            <Badge>{majorPct}%</Badge>
          </div>
          <Progress value={majorPct} />
          {majorFinished && (
            <p className="text-green-600 font-medium">PROFETAS MAIORES FINALIZADOS</p>
          )}
          {!majorFinished && majorFinishedByMarkers && (
            <p className="text-amber-600">
              “Dias finais” concluídos, mas ainda há leituras dos Profetas Maiores pendentes.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
