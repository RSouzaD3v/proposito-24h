import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export default async function MinorProphetsProgress() {
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

  // Profetas Menores
  const minorOR = [
    ...containsAny("Oséias", "Oseias"),
    ...containsAny("Joel"),
    ...containsAny("Amós", "Amos"),
    ...containsAny("Obadias"),
    ...containsAny("Jonas"),
    ...containsAny("Miquéias", "Miqueias"),
    ...containsAny("Naum"),
    ...containsAny("Habacuque", "Habacuc"),
    ...containsAny("Sofonias", "Sofonías"),
    ...containsAny("Ageu"),
    ...containsAny("Zacarias", "Zacarías"),
    ...containsAny("Malaquias", "Malaquías"),
  ];

  // Dias do plano pertencentes aos Profetas Menores
  const minorDayIds = await db.readingDay.findMany({
    where: { planId, OR: minorOR },
    select: { id: true },
  });
  const minorIds = minorDayIds.map((d) => d.id);
  const minorTotal = minorIds.length;

  // Quantos desses dias o usuário completou?
  const minorCompleted = await db.userReadingProgress.count({
    where: {
      userId: session.user.id,
      planId,
      completed: true,
      dayId: { in: minorIds },
    },
  });

  const minorPct = minorTotal === 0 ? 0 : Math.round((minorCompleted / minorTotal) * 100);

  // “Dias finais” (com variantes para acentuação/grafia)
  const lastMarkers = [
    "Oséias 11-14", "Oseias 11-14",
    "Joel 1-3",
    "Amós 8-9", "Amos 8-9",
    "Obadias 1",
    "Jonas 1-4",
    "Miquéias 5-7", "Miqueias 5-7",
    "Naum 1-3",
    "Habacuque 1-3", "Habacuc 1-3",
    "Sofonias 1-3", "Sofonías 1-3",
    "Ageu 1-2",
    "Zacarias 13-14", "Zacarías 13-14",
    "Malaquias 1-4", "Malaquías 1-4",
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

  // Usa a quantidade real de “dias finais” encontrados (evita duplicidade por variantes)
  const requiredLastDayCount = lastDayIds.length;

  const minorFinished = minorTotal > 0 && minorCompleted === minorTotal;
  const minorFinishedByMarkers =
    requiredLastDayCount > 0 && finishedMarkersCount === requiredLastDayCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso de Leitura - Profetas Menores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-2">
              <p>Oséias, Joel, Amós, Obadias, Jonas, Miquéias, Naum, Habacuque, Sofonias, Ageu, Zacarias, Malaquias</p>
            </div>
            <Badge>{minorPct}%</Badge>
          </div>
          <Progress value={minorPct} />
          {minorFinished && (
            <p className="text-green-600 font-medium">PROFETAS MENORES FINALIZADOS</p>
          )}
          {!minorFinished && minorFinishedByMarkers && (
            <p className="text-amber-600">
              “Dias finais” concluídos, mas ainda há leituras dos Profetas Menores pendentes.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
