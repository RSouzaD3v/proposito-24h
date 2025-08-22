import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { FaMedal, FaQuoteRight, FaBible } from "react-icons/fa";

type AchievementType = "devotional" | "verse" | "quote" | "all";

interface Achievements {
  completed: AchievementType[];
}

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

  // Simulação de achievements (substituir por lógica real depois)
  const achievements: Achievements = { completed: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white py-6 px-2 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/reader/area"
            className="p-2 rounded-full hover:bg-amber-100 transition"
          >
            <FiArrowLeft className="text-2xl text-amber-700" />
          </Link>
          <h2 className="flex-1 text-center text-2xl md:text-3xl font-bold text-amber-900 tracking-tight">
            Minha Jornada
          </h2>
        </div>

        {/* Progresso */}
        <Card className="border-none shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center gap-1">
            <h3 className="text-lg md:text-xl font-semibold text-amber-800">
              Meu Progresso
            </h3>
          </CardHeader>
          <CardContent className="flex justify-around py-6 gap-4 text-center">
            <ProgressBox
              icon={<FaMedal className="text-amber-500 text-3xl mb-1" />}
              value={userCompetetionsDevotional.length}
              label="Devocionais"
            />
            <ProgressBox
              icon={<FaBible className="text-amber-400 text-3xl mb-1" />}
              value={completedVerses}
              label="Versículos"
            />
            <ProgressBox
              icon={<FaQuoteRight className="text-amber-300 text-3xl mb-1" />}
              value={completedQuotes}
              label="Citações"
            />
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card className="border-none shadow-md bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center gap-1">
            <h3 className="text-lg md:text-xl font-semibold text-amber-800">
              Minhas Conquistas
            </h3>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-6 py-6">
            {achievements.completed.length > 0 ? (
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
              <span className="text-gray-600 text-sm font-medium">
                Nenhuma conquista ainda
              </span>
            )}
          </CardContent>
        </Card>
      </div>
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
      <span className="text-amber-700 font-bold text-lg md:text-2xl">
        {value} / 365
      </span>
      <span className="text-gray-600 text-xs md:text-sm font-medium">
        {label}
      </span>
    </div>
  );
}

function AchievementCard({ img, label }: { img: string; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[80px]">
      <div className="bg-gray-100 shadow w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden">
        <img src={img} alt={label} className="object-cover w-full h-full" />
      </div>
      <span className="text-gray-700 text-xs md:text-sm font-medium mt-2 text-center">
        {label}
      </span>
    </div>
  );
}
