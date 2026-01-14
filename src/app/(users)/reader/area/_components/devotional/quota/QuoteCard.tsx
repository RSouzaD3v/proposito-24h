// app/reader/area/_components/devotional/quota/QuoteCard.tsx

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { FaCheck } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";

interface QuoteCardProps {
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

export const QuoteCard = async ({
  colors,
  dayIndex,
  groupingDailyId,
}: QuoteCardProps) => {
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
          <h4>Nenhuma citação ainda.</h4>
        </CardContent>
      </Card>
    );
  }

  // 🔹 Busca citação pelo referenceDay + grouping
  const quote = await db.quote.findFirst({
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
      createdAt: "asc", // só para consistência interna
    },
  });

  if (!quote) {
    return (
      <Card className="bg-linear-to-r from-blue-50 to-blue-100">
        <CardContent className="flex items-center justify-center flex-col text-center h-full">
          <h4>Nenhuma citação ainda.</h4>
        </CardContent>
      </Card>
    );
  }

  // 🔹 Verifica se o usuário já concluiu
  const userCompletionQuote = await db.userCompletationQuote.findFirst({
    where: {
      userId: user.id,
      quoteId: quote.id,
    },
    select: { id: true },
  });

  return (
    <Card
      style={{
        backgroundColor: colors.background,
      }}
    >
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiActivity size={25} />
          <h2>Citação Diária</h2>
        </div>

        {userCompletionQuote && (
          <div
            style={{ backgroundColor: colors.independenteColor1 }}
            className="w-6 h-6 flex items-center justify-center text-white rounded-full shadow-lg"
          >
            <FaCheck />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <h4>A CITAÇÃO DO DIA É DE:</h4>
        <h2 className="text-xl font-bold">{quote.nameAuthor}</h2>
      </CardContent>

      <CardFooter>
        <Link
          href={`/reader/area/quote/${quote.id}`}
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
