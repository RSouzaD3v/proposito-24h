// app/reading/plan/[planRef]/page.tsx
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { notFound, redirect } from "next/navigation";
import PlanClient from "./plan-client";
import Link from "next/link";

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

  const userReader = await db.user.findUnique({
    where: { id: session.user.id },
    include: { writer: {
      select: { id: true, name: true, slug: true }
    } },
  });

  if (!userReader || !userReader.writerId) {
    return (
      <div>
        <h2>Acesso Negado</h2>
        <p>Você precisa ser um escritor para acessar este plano de leitura.</p>
      </div>
    );
  }

      const verifyAccess = await db.writerReaderAccess.findFirst({
        where: {
            writerId: userReader.writerId
        }
    });

    const subscription = await db.readerSubscription.findFirst({
        where: {
            writerId: userReader.writerId,
            readerId: session.user.id
        }
    });

    if (!verifyAccess?.biblePlan || !subscription) {
        return (
            <div className="min-h-screen px-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                <div className="bg-white/80 shadow-xl rounded-2xl px-8 py-10 max-w-xl w-full flex flex-col items-center">
                    <h2 className="mb-8 text-gray-500 tracking-widest text-xs font-semibold">Acesso Negado</h2>
                    <p className="text-gray-600">Você precisa de uma assinatura para acessar esta citação.</p>

                    <div className="mt-8 flex gap-4 w-full justify-center">
                        <Link
                            href="/reader/area"
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
                        >
                            Voltar
                        </Link>
                        <Link
                            href={`/reader/area/w/${userReader.writer?.slug}`}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                        >
                            Assinar agora
                        </Link>
                    </div>
                </div>
            </div>
        );
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
