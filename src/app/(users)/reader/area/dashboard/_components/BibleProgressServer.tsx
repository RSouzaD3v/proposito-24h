// app/(dashboard)/_components/BibleProgressServer.tsx
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { OldTestamentRadial } from "@/components/charts/OldTestamentRadial";
import { NewTestamentRadial } from "@/components/charts/NewTestamentRadial";
import { OverallBibleRadial } from "@/components/charts/OverallBibleRadial";

function containsAny(names: string[]) {
  return names.map((n) => ({ passages: { contains: n, mode: "insensitive" as const } }));
}

export default async function BibleProgressServer() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // Descobre o plano do usuário (ajuste conforme sua regra de "plano ativo")
  const anyProgress = await db.userReadingProgress.findFirst({
    where: { userId: session.user.id },
    select: { planId: true },
  });
  const fallbackPlan = await db.bibleReadingPlan.findFirst({ select: { id: true } });
  const planId = anyProgress?.planId ?? fallbackPlan?.id;
  if (!planId) return null;

  // --- Listas de livros ---
  const NT = [
    "Mateus","Marcos","Lucas","João","Joao","Atos","Atos dos Apóstolos","Atos dos Apostolos",
    "Romanos","1 Coríntios","1 Corintios","2 Coríntios","2 Corintios","Gálatas","Galatas",
    "Efésios","Efesios","Filipenses","Colossenses","1 Tessalonicenses","2 Tessalonicenses",
    "1 Timóteo","1 Timoteo","2 Timóteo","2 Timoteo","Tito","Filemom","Filemon",
    "Hebreus","Tiago","1 Pedro","2 Pedro","1 João","1 Joao","2 João","2 Joao","3 João","3 Joao",
    "Judas","Apocalipse"
  ];

  const OT = [
    "Gênesis","Genesis","Êxodo","Exodo","Levítico","Levitico","Números","Numeros","Deuteronômio","Deuteronomio",
    "Josué","Josue","Juízes","Juizes","Rute",
    "1 Samuel","2 Samuel","1 Reis","2 Reis","1 Crônicas","1 Cronicas","2 Crônicas","2 Cronicas",
    "Esdras","Neemias","Ester",
    "Jó","Jo","Salmos","Provérbios","Proverbios","Eclesiastes","Cântico dos Cânticos","Cantico dos Canticos","Cânticos","Canticos","Cantares",
    "Isaías","Isaias","Jeremias","Lamentações","Lamentacoes","Ezequiel","Daniel",
    "Oséias","Oseias","Joel","Amós","Amos","Obadias","Jonas","Miquéias","Miqueias","Naum",
    "Habacuque","Habacuc","Sofonias","Ageu","Zacarias","Zacarías","Malaquias","Malaquías"
  ];

  // --- Totais do plano ---
  const totalDays = await db.readingDay.count({ where: { planId } });
  const completedDays = await db.userReadingProgress.count({
    where: { userId: session.user.id, planId, completed: true },
  });
  const overallPct = totalDays === 0 ? 0 : Math.round((completedDays / totalDays) * 100);

  // --- NT ---
  const ntDayIds = await db.readingDay.findMany({
    where: { planId, OR: containsAny(NT) },
    select: { id: true },
  });
  const ntIds = ntDayIds.map((d) => d.id);
  const ntTotal = ntIds.length;
  const ntCompleted = await db.userReadingProgress.count({
    where: { userId: session.user.id, planId, completed: true, dayId: { in: ntIds } },
  });
  const ntPct = ntTotal === 0 ? 0 : Math.round((ntCompleted / ntTotal) * 100);

  // --- OT ---
  const otDayIds = await db.readingDay.findMany({
    where: { planId, OR: containsAny(OT) },
    select: { id: true },
  });
  const otIds = otDayIds.map((d) => d.id);
  const otTotal = otIds.length;
  const otCompleted = await db.userReadingProgress.count({
    where: { userId: session.user.id, planId, completed: true, dayId: { in: otIds } },
  });
  const otPct = otTotal === 0 ? 0 : Math.round((otCompleted / otTotal) * 100);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <OldTestamentRadial value={otPct} />
      <NewTestamentRadial value={ntPct} />
      <OverallBibleRadial value={overallPct} />
    </div>
  );
}
