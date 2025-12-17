import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export default async function PentateucoProgress() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="mt-4">Você precisa estar logado para acessar o Dashboard Bíblico.</p>
      </div>
    );
  }

  // Pegue o plano do usuário. Ajuste conforme sua regra (ex.: plano ativo)
  // Aqui eu deduzo pelo primeiro progresso do usuário. Se quiser, passe por query/param.
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

  // 1) Quais dias do plano pertencem ao Pentateuco?
  // Observação: usamos contains com mode: 'insensitive' + variações sem acento.
  const pentateuchOR = [
    { passages: { contains: "Gênesis", mode: "insensitive" as const } },
    { passages: { contains: "Genesis", mode: "insensitive" as const } },
    { passages: { contains: "Êxodo", mode: "insensitive" as const } },
    { passages: { contains: "Exodo", mode: "insensitive" as const } },
    { passages: { contains: "Levítico", mode: "insensitive" as const } },
    { passages: { contains: "Levitico", mode: "insensitive" as const } },
    { passages: { contains: "Números", mode: "insensitive" as const } },
    { passages: { contains: "Numeros", mode: "insensitive" as const } },
    { passages: { contains: "Deuteronômio", mode: "insensitive" as const } },
    { passages: { contains: "Deuteronomio", mode: "insensitive" as const } },
  ];

  const pentateuchDayIds = await db.readingDay.findMany({
    where: { planId, OR: pentateuchOR },
    select: { id: true },
  });
  const pentateuchIds = pentateuchDayIds.map(d => d.id);
  const pentateuchTotal = pentateuchIds.length;

  // 2) Quantos desses dias o usuário marcou como completos?
  const pentateuchCompleted = await db.userReadingProgress.count({
    where: {
      userId: session.user.id,
      planId,
      completed: true,
      dayId: { in: pentateuchIds },
    },
  });

  const pentateuchPct = pentateuchTotal === 0
    ? 0
    : Math.round((pentateuchCompleted / pentateuchTotal) * 100);

  // (Opcional) Regra “livros finalizados”: verificar se os DIAS FINAIS de cada livro foram concluídos.
  // Use as marcas do seu plano (ajuste as strings exatamente como estão no campo 'passages').
  const lastMarkers = [
    "Gênesis 49-50",
    "Êxodo 40",
    "Levítico 25-27",
    "Números 34-36",
    "Deuteronômio 34",
  ];

  const lastDayIds = await db.readingDay.findMany({
    where: {
      planId,
      OR: lastMarkers.map(m => ({ passages: { contains: m, mode: "insensitive" as const } })),
    },
    select: { id: true },
  });

  const finishedMarkersCount = await db.userReadingProgress.count({
    where: {
      userId: session.user.id,
      planId,
      completed: true,
      dayId: { in: lastDayIds.map(d => d.id) },
    },
  });

  const pentateuchFinished = pentateuchTotal > 0 && pentateuchCompleted === pentateuchTotal;
  const pentateuchFinishedByMarkers = finishedMarkersCount === lastMarkers.length;

  return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso de Leitura - Pentateuco</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 px-2">
                <p>Gênesis, Êxodo, Levítico, Números, Deuteronômio</p>
              </div>
              <Badge>{pentateuchPct}%</Badge>
            </div>
            <Progress value={pentateuchPct} />
            {pentateuchFinished && <p className="text-green-600 font-medium">PENTATEUCO FINALIZADO</p>}
            {!pentateuchFinished && pentateuchFinishedByMarkers && (
              <p className="text-amber-600">Livros concluídos (pelos “dias finais”), mas ainda há dias do Pentateuco pendentes.</p>
            )}
          </div>
        </CardContent>
      </Card>
  );
}
