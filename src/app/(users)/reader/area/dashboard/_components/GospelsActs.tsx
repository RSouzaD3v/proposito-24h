import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export default async function GospelsActsProgress() {
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

  // Evangelhos + Atos
  const gospelsActsOR = [
    ...containsAny("Mateus"),
    ...containsAny("Marcos"),
    ...containsAny("Lucas"),
    ...containsAny("João", "Joao"),
    ...containsAny("Atos", "Atos dos Apóstolos", "Atos dos Apostolos"),
  ];

  // Dias do plano que pertencem ao grupo
  const dayIds = await db.readingDay.findMany({
    where: { planId, OR: gospelsActsOR },
    select: { id: true },
  });
  const ids = dayIds.map((d) => d.id);
  const total = ids.length;

  // Quantos desses dias o usuário completou?
  const completed = await db.userReadingProgress.count({
    where: {
      userId: session.user.id,
      planId,
      completed: true,
      dayId: { in: ids },
    },
  });

  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  // “Dias finais” (com variantes para acento e nome)
  const lastMarkers = [
    "Mateus 27-28",
    "Marcos 15-16",
    "Lucas 22-24",
    "João 18-21", "Joao 18-21",
    "Atos 27-28",
    "Atos dos Apóstolos 27-28", "Atos dos Apostolos 27-28",
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

  const finishedAllDays = total > 0 && completed === total;
  const finishedByMarkers =
    requiredLastDayCount > 0 && finishedMarkersCount === requiredLastDayCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso de Leitura — Evangelhos e Atos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-2">
              <p>Mateus, Marcos, Lucas, João, Atos</p>
            </div>
            <Badge>{pct}%</Badge>
          </div>
          <Progress value={pct} />
          {finishedAllDays && (
            <p className="text-green-600 font-medium">EVANGELHOS E ATOS FINALIZADOS</p>
          )}
          {!finishedAllDays && finishedByMarkers && (
            <p className="text-amber-600">
              “Dias finais” concluídos, mas ainda há leituras pendentes neste bloco.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
