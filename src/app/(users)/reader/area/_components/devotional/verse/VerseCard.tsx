// app/reader/area/_components/devotional/verse/VerseCard.tsx

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { FaCheck } from "react-icons/fa";
import { FiBook } from "react-icons/fi";

interface VerseCardProps {
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

export const VerseCard = async ({
  colors,
  dayIndex,
  groupingDailyId,
}: VerseCardProps) => {
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
          <h4>Nenhum versículo ainda.</h4>
        </CardContent>
      </Card>
    );
  }

  // 🔹 Busca versículo pelo referenceDay + grouping
  const verse = await db.verse.findFirst({
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
      createdAt: "asc", // apenas para consistência
    },
  });

  if (!verse) {
    return (
      <Card className="bg-linear-to-r from-blue-50 to-blue-100">
        <CardContent className="flex items-center justify-center flex-col text-center h-full">
          <h4>Nenhum versículo ainda.</h4>
        </CardContent>
      </Card>
    );
  }

  // 🔹 Verifica conclusão do usuário
  const userCompletionVerse = await db.userCompletationVerse.findFirst({
    where: {
      userId: user.id,
      verseId: verse.id,
    },
    select: { id: true },
  });

  return (
    <Card style={{ backgroundColor: colors.background }}>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiBook size={25} />
          <h2>Passagem</h2>
        </div>

        {userCompletionVerse && (
          <div
            style={{ backgroundColor: colors.independenteColor1 }}
            className="w-6 h-6 flex items-center justify-center text-white rounded-full shadow-lg"
          >
            <FaCheck />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <h2 className="text-xl font-bold">{verse.reference}</h2>
      </CardContent>

      <CardFooter>
        <Link
          href={`/reader/area/verse/${verse.id}`}
          style={{
            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            color: colors.buttonText,
          }}
          className="p-2 text-center text-xl font-bold w-full rounded-xl hover:underline"
        >
          Ler
        </Link>
      </CardFooter>
    </Card>
  );
};
