import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export default async function PaulineLettersProgress() {
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

  // Cartas Paulinas
  const paulinesOR = [
    ...containsAny("Romanos"),
    ...containsAny("1 Coríntios", "1 Corintios"),
    ...containsAny("2 Coríntios", "2 Corintios"),
    ...containsAny("Gálatas", "Galatas"),
    ...containsAny("Efésios", "Efesios"),
    ...containsAny("Filipenses"),
    ...containsAny("Colossenses"),
    ...containsAny("1 Tessalonicenses"),
    ...containsAny("2 Tessalonicenses"),
    ...containsAny("1 Timóteo", "1 Timoteo"),
    ...containsAny("2 Timóteo", "2 Timoteo"),
    ...containsAny("Tito"),
    ...containsAny("Filemom", "Filemon"),
  ];

  // Dias do plano pertencentes às Paulinas
  const paulineDayIds = await db.readingDay.findMany({
    where: { planId, OR: paulinesOR },
    select: { id: true },
  });
  const paulineIds = paulineDayIds.map((d) => d.id);
  const paulineTotal = paulineIds.length;

  // Quantos desses dias o usuário completou?
  const paulineCompleted = await db.userReadingProgress.count({
    where: {
      userId: session.user.id,
      planId,
      completed: true,
      dayId: { in: paulineIds },
    },
  });

  const paulinePct = paulineTotal === 0 ? 0 : Math.round((paulineCompleted / paulineTotal) * 100);

  // “Dias finais” (variantes para acento/grafia)
  const lastMarkers = [
    "Romanos 15-16",
    "1 Coríntios 16", "1 Corintios 16",
    "2 Coríntios 13", "2 Corintios 13",
    "Gálatas 5-6", "Galatas 5-6",
    "Efésios 5-6", "Efesios 5-6",
    "Filipenses 1-4",
    "Colossenses 1-4",
    "1 Tessalonicenses 5",
    "2 Tessalonicenses 1-3",
    "1 Timóteo 5-6", "1 Timoteo 5-6",
    "2 Timóteo 1-4", "2 Timoteo 1-4",
    "Tito 1-3",
    "Filemom 1", "Filemon 1",
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

  const paulineFinished = paulineTotal > 0 && paulineCompleted === paulineTotal;
  const paulineFinishedByMarkers =
    requiredLastDayCount > 0 && finishedMarkersCount === requiredLastDayCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso de Leitura — Cartas Paulinas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-2">
              <p>
                Romanos, 1–2 Coríntios, Gálatas, Efésios, Filipenses, Colossenses, 1–2 Tessalonicenses,
                1–2 Timóteo, Tito, Filemom
              </p>
            </div>
            <Badge>{paulinePct}%</Badge>
          </div>
          <Progress value={paulinePct} />
          {paulineFinished && (
            <p className="text-green-600 font-medium">CARTAS PAULINAS FINALIZADAS</p>
          )}
          {!paulineFinished && paulineFinishedByMarkers && (
            <p className="text-amber-600">
              “Dias finais” concluídos, mas ainda há leituras das Paulinas pendentes.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
