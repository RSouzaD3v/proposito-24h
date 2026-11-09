import { apiPostOrNull } from "@/lib/api/server";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/authOption";

import WordConnectPlay from "./_components/WordConnectPlay";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GamePlayPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const { slug } = await params;

  const play = await apiPostOrNull<any>(`/reader/games/${encodeURIComponent(slug)}/play`);
  if (!play) notFound();
  const level = play.level;

  if (!level) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Parabéns 🎉</h1>
          <p className="text-muted-foreground">
            Você concluiu todos os níveis deste jogo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WordConnectPlay
      slug={slug}
      levelId={level.id}
      letters={level.letters}
      layout={level.layout}
      words={level.words.map((w: { word: string; bonus: boolean }) => ({
        word: w.word,
        bonus: w.bonus,
      }))}
      currentLevel={level.order}
      coins={play.coins}
    />
  );
}
