// app/reader/area/_components/devotional/prayer/PrayerCard.tsx

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { FaCheck } from "react-icons/fa";
import { HandHeart } from "lucide-react";
import AudioButton from "../devotional/AudioButton";

interface DayRange {
  gte: Date;
  lt: Date;
}

interface PrayerCardProps {
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
  dayRange: DayRange;
}

export const PrayerCard = async ({ colors, dayRange }: PrayerCardProps) => {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, writerId: true },
  });

  if (!user?.writerId) return null;

  const prayer = await db.prayer.findFirst({
    where: {
      writerId: user.writerId,
      createdAt: {
        gte: dayRange.gte,
        lt: dayRange.lt,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!prayer) {
    return (
      <Card className="bg-linear-to-r from-blue-50 to-blue-100">
        <CardContent className="flex items-center justify-center flex-col text-center h-full">
          <h4>Nenhuma citação ainda.</h4>
        </CardContent>
      </Card>
    );
  }

  const userCompletationPrayer =
    await db.userCompletationPrayer.findFirst({
      where: { userId: user.id, prayerId: prayer.id },
      select: { id: true },
    });

  return (
    <Card style={{ backgroundColor: colors.background }}>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HandHeart size={25} />
          <h2>Oração</h2>
        </div>

        {userCompletationPrayer && (
          <div
            style={{ backgroundColor: colors.independenteColor1 }}
            className="w-6 h-6 flex items-center justify-center text-white rounded-full shadow-lg"
          >
            <FaCheck />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <h4>ORAÇÃO DO DIA:</h4>
        <h2 className="text-xl font-bold">{prayer.title}</h2>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 w-full">
        <Link
          style={{
            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            color: colors.buttonText,
          }}
          href={`/reader/area/prayer/${prayer.id}`}
          className="px-4 py-2 text-center text-xl font-bold w-full rounded-xl hover:underline"
        >
          Ler
        </Link>

        <AudioButton
          src={prayer.audioUrl}
          style={{
            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            color: colors.buttonText,
          }}
          className="py-2 w-full rounded-xl"
          labelPlay="Ouvir"
          labelPause="Parar"
        />
      </CardFooter>
    </Card>
  );
};
