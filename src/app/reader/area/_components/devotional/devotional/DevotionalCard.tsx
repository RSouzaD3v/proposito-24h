import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { authOptions } from "@/lib/authOption"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { FaCheck, FaComments } from "react-icons/fa"
import { startOfDay, addDays } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import AudioButton from "./AudioButton"; // ⬅️ novo

const TZ = "America/Sao_Paulo";

function brasiliaDayRange(now = new Date()) {
  const localNow = toZonedTime(now, TZ);
  const start = startOfDay(localNow);
  const next = startOfDay(addDays(start, 1));
  return {
    gte: fromZonedTime(start, TZ),
    lt: fromZonedTime(next, TZ),
  };
}

interface DevotionalCardProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    buttonBg: string;
    buttonText: string;
    text: string;
    independenteColor1: string;
    independenteColor2: string;
  };
}

export const DevotionalCard = async ({ colors }: DevotionalCardProps) => {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.writerId) return null;

  const { gte, lt } = brasiliaDayRange();

  const devotional = await db.devotional.findFirst({
    where: { writerId: user.writerId, createdAt: { gte, lt } },
    orderBy: { createdAt: "asc" },
  });

  if (!devotional) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
        <CardContent className="flex items-center justify-center flex-col text-center h-full">
          <h4>Nenhum devocional ainda.</h4>
        </CardContent>
      </Card>
    );
  }

  let userCompletationDevotional: { id: string } | null = null;
  try {
    userCompletationDevotional = await db.userCompletationDevotional.findFirst({
      where: { userId: user.id, devotionalId: devotional.id },
      select: { id: true },
    });
  } catch (e) {
    console.error("userCompletationDevotional query failed:", e);
  }

  return (
    <Card style={{ backgroundColor: colors.background }}>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaComments size={25} />
          <h2>Devocional</h2>
        </div>
        {userCompletationDevotional ? (
          <div style={{ backgroundColor: colors.independenteColor1 }} className="w-6 h-6 flex items-center justify-center text-white rounded-full shadow-lg">
            <FaCheck />
          </div>
        ) : null}
      </CardHeader>

      <CardContent>
        <h2 className="text-xl font-bold">{devotional.title}</h2>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 w-full">
        <Link
          style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`, color: colors.buttonText }}
          href={`/reader/area/devotional/${devotional.id}`}
          className="px-4 py-2 text-center text-xl font-bold w-full rounded-xl hover:underline"
        >
          Ler
        </Link>

        {/* Botão Ouvir/Pausar – só aparece se existir audioUrl */}
        <AudioButton
          src={devotional.audioUrl}
          style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`, color: colors.buttonText }}
          className="py-2 w-full rounded-xl"
          labelPlay="Ouvir"
          labelPause="Parar"
        />
      </CardFooter>
    </Card>
  );
};
