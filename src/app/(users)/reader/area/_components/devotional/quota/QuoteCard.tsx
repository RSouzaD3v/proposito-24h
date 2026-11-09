import type { HomeCard } from "@/lib/api/types";
// app/reader/area/_components/devotional/quota/QuoteCard.tsx

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
  item: HomeCard | null;
}

export const QuoteCard = ({ colors, item: quote }: QuoteCardProps) => {
  if (!quote) {
    return (
      <Card className="bg-linear-to-r from-blue-50 to-blue-100">
        <CardContent className="flex items-center justify-center flex-col text-center h-full">
          <h4>Nenhuma citação ainda.</h4>
        </CardContent>
      </Card>
    );
  }

  const userCompletionQuote = quote.completed;

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
          style={{
            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            color: colors.buttonText,
          }}
          href={`/reader/area/quote/${quote.id}`}
          className="p-2 text-center text-xl font-bold w-full rounded-xl hover:underline"
        >
          Ler
        </Link>
      </CardFooter>
    </Card>
  );
};
