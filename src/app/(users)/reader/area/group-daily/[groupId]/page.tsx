import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function ReaderGroupDailyDetailPage({
  params,
}: PageProps) {
  const { groupId } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.writerId) {
    return (
      <p className="text-sm text-muted-foreground">
        Você precisa estar logado para acessar este conteúdo.
      </p>
    );
  }

  /* 1) Permissões do writer */
  const access = await db.writerReaderAccess.findUnique({
    where: { writerId: session.user.writerId },
  });

  if (!access) notFound();

  /* 2) Agrupamento + conteúdos (ordenados) */
  const grouping = await db.groupingDaily.findFirst({
    where: {
      id: groupId,
      writerId: session.user.writerId,
      active: true,
    },
    include: {
      devotionals: access.devotional
        ? { orderBy: { createdAt: "asc" } }
        : false,
      verses: access.verse
        ? { orderBy: { createdAt: "asc" } }
        : false,
      prayers: access.prayer
        ? { orderBy: { createdAt: "asc" } }
        : false,
      quotes: access.quote
        ? { orderBy: { createdAt: "asc" } }
        : false,
    },
  });

  if (!grouping) notFound();

  /* 3) Conteúdos já lidos (UserCompletation*) */
  const [
    completedDevotionals,
    completedVerses,
    completedPrayers,
    completedQuotes,
  ] = await Promise.all([
    db.userCompletationDevotional.findMany({
      where: { userId: session.user.id },
      select: { devotionalId: true },
    }),
    db.userCompletationVerse.findMany({
      where: { userId: session.user.id },
      select: { verseId: true },
    }),
    db.userCompletationPrayer.findMany({
      where: { userId: session.user.id },
      select: { prayerId: true },
    }),
    db.userCompletationQuote.findMany({
      where: { userId: session.user.id },
      select: { quoteId: true },
    }),
  ]);

  const completed = {
    devotionals: new Set(completedDevotionals.map(d => d.devotionalId)),
    verses: new Set(completedVerses.map(v => v.verseId)),
    prayers: new Set(completedPrayers.map(p => p.prayerId)),
    quotes: new Set(completedQuotes.map(q => q.quoteId)),
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">
        <Link href={"/reader/area/group-daily"}>
          <Button className="my-2 cursor-pointer">
            Voltar
          </Button>
        </Link>
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{grouping.title}</h1>
        {grouping.description && (
          <p className="text-sm text-muted-foreground">
            {grouping.description}
          </p>
        )}
      </div>

      {/* TABS */}
      <Tabs defaultValue="devotionals">
        <TabsList className="grid grid-cols-4">
          {access.devotional && (
            <TabsTrigger value="devotionals">
              Devocionais
            </TabsTrigger>
          )}
          {access.verse && (
            <TabsTrigger value="verses">
              Versículos
            </TabsTrigger>
          )}
          {access.prayer && (
            <TabsTrigger value="prayers">
              Orações
            </TabsTrigger>
          )}
          {access.quote && (
            <TabsTrigger value="quotes">
              Citações
            </TabsTrigger>
          )}
        </TabsList>

        {/* DEVOCIONAIS */}
        {access.devotional && (
          <TabsContent value="devotionals">
            <List>
              {grouping.devotionals.map(item => (
                <ReadRow
                  key={item.id}
                  title={item.title}
                  href={`/reader/area/devotional/${item.id}`}
                  completed={completed.devotionals.has(item.id)}
                />
              ))}
            </List>
          </TabsContent>
        )}

        {/* VERSÍCULOS */}
        {access.verse && (
          <TabsContent value="verses">
            <List>
              {grouping.verses.map(item => (
                <ReadRow
                  key={item.id}
                  title={item.reference}
                  href={`/reader/area/verse/${item.id}`}
                  completed={completed.verses.has(item.id)}
                />
              ))}
            </List>
          </TabsContent>
        )}

        {/* ORAÇÕES */}
        {access.prayer && (
          <TabsContent value="prayers">
            <List>
              {grouping.prayers.map(item => (
                <ReadRow
                  key={item.id}
                  title={item.title}
                  href={`/reader/area/prayer/${item.id}`}
                  completed={completed.prayers.has(item.id)}
                />
              ))}
            </List>
          </TabsContent>
        )}

        {/* CITAÇÕES */}
        {access.quote && (
          <TabsContent value="quotes">
            <List>
              {grouping.quotes.map(item => (
                <ReadRow
                  key={item.id}
                  title={item.verse}
                  href={`/reader/area/quote/${item.id}`}
                  completed={completed.quotes.has(item.id)}
                />
              ))}
            </List>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

/* ======================================================
 * COMPONENTES AUXILIARES
 * ====================================================== */

function List({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 mt-4">{children}</div>;
}

function ReadRow({
  title,
  href,
  completed,
}: {
  title: string;
  href: string;
  completed: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <p className="text-sm font-medium">{title}</p>

        {completed ? (
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle size={16} />
            Lido
          </div>
        ) : (
          <Button asChild size="sm">
            <Link href={href}>Ler agora</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
