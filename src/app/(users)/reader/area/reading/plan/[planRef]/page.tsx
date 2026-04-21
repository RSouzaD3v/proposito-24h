// app/reading/plan/[planRef]/page.tsx
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { notFound, redirect } from "next/navigation";
import PlanClient from "./plan-client";
import Link from "next/link";
import { ScreenSubscription } from "../../../_components/ScreenSubscription";
import { getReaderContentGate } from "@/lib/readerAccessForWriter";

type Props = { params: Promise<{ planRef: string }> };

export default async function PlanPage({ params }: Props) {
  const { planRef } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Resolve o plano por ID ou por apelido "365"
  let plan = null;
  if (planRef === "365") {
    plan = await db.bibleReadingPlan.findFirst({
      where: { name: "Plano Bíblia em 365 Dias" },
      include: { days: { orderBy: { dayNumber: "asc" } } },
    });
  } else {
    plan = await db.bibleReadingPlan.findUnique({
      where: { id: planRef },
      include: { days: { orderBy: { dayNumber: "asc" } } },
    });
  }

  if (!plan) notFound();

  const userProgress = await db.userReadingProgress.findMany({
    where: { userId: session.user.id, planId: plan.id },
    select: { dayId: true },
  });

  const completedDayIds = new Set(userProgress.map((p) => p.dayId));

  // Usuário (precisamos do writer atual p/ regra de acesso)
  const userReader = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      writer: { select: { id: true, name: true, slug: true } },
    },
  });

  // Se sua regra exige que o usuário seja "writer" para ver o plano, mantenha:
  if (!userReader || !userReader.writerId) {
    return (
      <div>
        <h2>Acesso Negado</h2>
        <p>Você precisa ser um escritor para acessar este plano de leitura.</p>
      </div>
    );
  }

  const gate = await getReaderContentGate(userReader.writerId, session.user.id, "biblePlan");
  if (!gate.allowed) {
    return <ScreenSubscription slug={userReader.writer?.slug || ""} />;
  }

  return (
    <PlanClient
      planId={plan.id}
      planName={plan.name}
      days={plan.days.map(d => ({ id: d.id, dayNumber: d.dayNumber, passages: d.passages }))}
      completedInitial={[...completedDayIds]}
    />
  );
}
