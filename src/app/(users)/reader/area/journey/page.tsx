import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { FaMedal, FaQuoteRight, FaBible } from "react-icons/fa";
import { Achievements } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";

export default async function JourneyPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userCompetetionsDevotional = await db.userCompletationDevotional.findMany({
    where: { userId: session.user.id },
  });

  const completedVerses = await db.userCompletationVerse.count({
    where: { userId: session.user.id },
  });

  const completedQuotes = await db.userCompletationQuote.count({
    where: { userId: session.user.id },
  });

  const achievements: Achievements | null = await db.achievements.findFirst({
    where: { userId: session.user.id },
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        title="Minha Jornada"
        description="Seu progresso e conquistas na leitura diária"
        backHref="/reader/area"
        centered
      />

      <GlassCard strong className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-[var(--liquid-ink)] text-center mb-4">
          Meu Progresso
        </h3>
        <div className="flex justify-around py-4 gap-4 text-center">
          <ProgressBox
            icon={<FaMedal className="text-[var(--liquid-accent)] text-3xl mb-1" />}
            value={userCompetetionsDevotional.length}
            label="Devocionais"
          />
          <ProgressBox
            icon={<FaBible className="text-[var(--liquid-accent)] text-3xl mb-1 opacity-80" />}
            value={completedVerses}
            label="Versículos"
          />
          <ProgressBox
            icon={<FaQuoteRight className="text-[var(--liquid-accent)] text-3xl mb-1 opacity-60" />}
            value={completedQuotes}
            label="Citações"
          />
        </div>
      </GlassCard>

      <GlassCard strong>
        <h3 className="text-lg md:text-xl font-semibold text-[var(--liquid-ink)] text-center mb-4">
          Minhas Conquistas
        </h3>
        <div className="flex flex-wrap justify-center gap-6 py-4">
          {achievements && achievements.completed.length > 0 ? (
            <>
              {achievements.completed.includes("devotional") && (
                <AchievementCard
                  img="/achievements/devotional.gif"
                  label="365 Dias de Devocionais"
                />
              )}
              {achievements.completed.includes("verse") && (
                <AchievementCard
                  img="/achievements/verse.gif"
                  label="365 Dias de Versículos"
                />
              )}
              {achievements.completed.includes("quote") && (
                <AchievementCard
                  img="/achievements/quote.gif"
                  label="365 Dias de Citações"
                />
              )}
              {achievements.completed.includes("all") && (
                <AchievementCard
                  img="/achievements/365.gif"
                  label="365 Dias de Todos os Tipos"
                />
              )}
            </>
          ) : (
            <span className="text-[var(--liquid-muted)] text-sm font-medium">
              Nenhuma conquista ainda
            </span>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function ProgressBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center min-w-[70px]">
      {icon}
      <span className="text-[var(--liquid-ink)] font-bold text-lg md:text-2xl">
        {value} / 365
      </span>
      <span className="text-[var(--liquid-muted)] text-xs md:text-sm font-medium">
        {label}
      </span>
    </div>
  );
}

function AchievementCard({ img, label }: { img: string; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[80px]">
      <div className="glass-surface shadow w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden">
        <img src={img} alt={label} className="object-cover w-full h-full" />
      </div>
      <span className="text-[var(--liquid-ink)] text-xs md:text-sm font-medium mt-2 text-center">
        {label}
      </span>
    </div>
  );
}
