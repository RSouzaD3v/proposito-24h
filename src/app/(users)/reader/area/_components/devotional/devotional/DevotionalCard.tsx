// app/reader/area/_components/devotional/devotional/DevotionalCard.tsx

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { FaCheck, FaComments } from "react-icons/fa";
import AudioButton from "./AudioButton";

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
  dayIndex: number;
  groupingDailyId?: string;
}

export const DevotionalCard = async ({
  colors,
  dayIndex,
  groupingDailyId,
}: DevotionalCardProps) => {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      writerId: true,
    },
  });

  if (!user?.writerId || !groupingDailyId) {
    return (
      <Card className="bg-linear-to-r from-blue-50 to-blue-100">
        <CardContent className="flex items-center justify-center flex-col text-center h-full">
          <h4>Nenhum devocional ainda.</h4>
        </CardContent>
      </Card>
    );
  }

  // 🔹 Busca devocional pelo referenceDay + grouping
  const devotional = await db.devotional.findFirst({
    where: {
      writerId: user.writerId,
      referenceDay: dayIndex,
      groupingDailies: {
        some: {
          id: groupingDailyId,
        },
      },
    },
    orderBy: {
      createdAt: "asc", // apenas para consistência interna
    },
  });

  if (!devotional) {
    return (
      <Card className="bg-linear-to-r from-blue-50 to-blue-100">
        <CardContent className="flex items-center justify-center flex-col text-center h-full">
          <h4>Nenhum devocional ainda.</h4>
        </CardContent>
      </Card>
    );
  }

  // 🔹 Verifica conclusão do usuário
  const userCompletationDevotional =
    await db.userCompletationDevotional.findFirst({
      where: {
        userId: user.id,
        devotionalId: devotional.id,
      },
      select: { id: true },
    });

  return (
    <Card style={{ backgroundColor: colors.background }}>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaComments size={25} />
          <h2>Devocional</h2>
        </div>

        {userCompletationDevotional && (
          <div
            style={{ backgroundColor: colors.independenteColor1 }}
            className="w-6 h-6 flex items-center justify-center text-white rounded-full shadow-lg"
          >
            <FaCheck />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <h2 className="text-xl font-bold">{devotional.title}</h2>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 w-full">
        <Link
          href={`/reader/area/devotional/${devotional.id}`}
          style={{
            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            color: colors.buttonText,
          }}
          className="px-4 py-2 text-center text-xl font-bold w-full rounded-xl hover:underline"
        >
          Ler
        </Link>

        {/* 🔊 Ouvir / Parar */}
        <AudioButton
          src={devotional.audioUrl}
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
