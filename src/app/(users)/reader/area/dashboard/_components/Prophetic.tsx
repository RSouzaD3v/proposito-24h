import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export default async function PropheticProgress() {
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

  // Bloco Profético (Apocalipse)
  const propheticOR = [
    ...containsAny("Apocalipse"),
    // Se no seu seed existir abreviação, descomente a linha abaixo:
    // ...containsAny("Ap  "),
  ];

  // Dias do plano pertencentes ao bloco
  const propheticDayIds = await db.readingDay.findMany({
    where: { planId, OR: propheticOR },
    select: { id: true },
  });
  const propheticIds = propheticDayIds.map((d) => d.id);
  const propheticTotal = propheticIds.length;

  // Quantos desses dias o usuário completou?
  const propheticCompleted = await db.userReadingProgress.count({
    where: {
      userId: session.user.id,
      planId,
      completed: true,
      dayId: { in: propheticIds },
    },
  });

  const propheticPct =
    propheticTotal === 0 ? 0 : Math.round((propheticCompleted / propheticTotal) * 100);

  // “Dia(s) final(is)” do bloco (conforme você informou)
  const lastMarkers = [
    "Apocalipse 1-4",
    // Se usar abreviação no plano, adicione aqui:
    // "Ap 1-4",
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

  const propheticFinished = propheticTotal > 0 && propheticCompleted === propheticTotal;
  const propheticFinishedByMarkers =
    requiredLastDayCount > 0 && finishedMarkersCount === requiredLastDayCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso de Leitura — Profético (Apocalipse)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-2">
              <p>Apocalipse</p>
            </div>
            <Badge>{propheticPct}%</Badge>
          </div>
          <Progress value={propheticPct} />
          {propheticFinished && (
            <p className="text-green-600 font-medium">APOCALIPSE FINALIZADO</p>
          )}
          {!propheticFinished && propheticFinishedByMarkers && (
            <p className="text-amber-600">
              “Dia final” concluído, mas ainda há leituras de Apocalipse pendentes.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
