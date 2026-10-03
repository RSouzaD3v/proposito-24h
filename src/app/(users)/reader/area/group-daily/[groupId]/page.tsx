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
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { GlassCard } from "@/components/ui/glass-card";
import { withReaderBackHref } from "@/lib/readerBackHref";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function ReaderGroupDailyDetailPage({
  params,
}: PageProps) {
  const { groupId } = await params;
  const from = `/reader/area/group-daily/${groupId}`;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.writerId) {
    return (
      <p className="text-sm text-[var(--liquid-muted)] px-4 py-8">
        Você precisa estar logado para acessar este conteúdo.
      </p>
    );
  }

  /* 1) Agrupamento + conteúdos (o bloqueio de acesso fica nas páginas de cada item) */
  const grouping = await db.groupingDaily.findFirst({
    where: {
      id: groupId,
      writerId: session.user.writerId,
      active: true,
    },
    include: {
      devotionals: { orderBy: { createdAt: "asc" } },
      verses: { orderBy: { createdAt: "asc" } },
      prayers: { orderBy: { createdAt: "asc" } },
      quotes: { orderBy: { createdAt: "asc" } },
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <BackButton href="/reader/area/group-daily" className="mb-2" />

      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-[var(--liquid-ink)]">
          {grouping.title}
        </h1>
        {grouping.description && (
          <p className="text-sm text-[var(--liquid-muted)]">
            {grouping.description}
          </p>
        )}
      </div>

      <GlassCard strong padding="md">
        <Tabs defaultValue="devotionals">
          <TabsList className="grid grid-cols-4">
            {grouping.devotionals.length > 0 && (
              <TabsTrigger value="devotionals">
                Devocionais
              </TabsTrigger>
            )}
            {grouping.verses.length > 0 && (
              <TabsTrigger value="verses">
                Versículos
              </TabsTrigger>
            )}
            {grouping.prayers.length > 0 && (
              <TabsTrigger value="prayers">
                Orações
              </TabsTrigger>
            )}
            {grouping.quotes.length > 0 && (
              <TabsTrigger value="quotes">
                Citações
              </TabsTrigger>
            )}
          </TabsList>

          {grouping.devotionals.length > 0 && (
            <TabsContent value="devotionals">
              <List>
                {grouping.devotionals.map(item => (
                  <ReadRow
                    key={item.id}
                    title={item.title}
                    href={withReaderBackHref(`/reader/area/devotional/${item.id}`, from)}
                    completed={completed.devotionals.has(item.id)}
                  />
                ))}
              </List>
            </TabsContent>
          )}

          {grouping.verses.length > 0 && (
            <TabsContent value="verses">
              <List>
                {grouping.verses.map(item => (
                  <ReadRow
                    key={item.id}
                    title={item.reference}
                    href={withReaderBackHref(`/reader/area/verse/${item.id}`, from)}
                    completed={completed.verses.has(item.id)}
                  />
                ))}
              </List>
            </TabsContent>
          )}

          {grouping.prayers.length > 0 && (
            <TabsContent value="prayers">
              <List>
                {grouping.prayers.map(item => (
                  <ReadRow
                    key={item.id}
                    title={item.title}
                    href={withReaderBackHref(`/reader/area/prayer/${item.id}`, from)}
                    completed={completed.prayers.has(item.id)}
                  />
                ))}
              </List>
            </TabsContent>
          )}

          {grouping.quotes.length > 0 && (
            <TabsContent value="quotes">
              <List>
                {grouping.quotes.map(item => (
                  <ReadRow
                    key={item.id}
                    title={item.verse}
                    href={withReaderBackHref(`/reader/area/quote/${item.id}`, from)}
                    completed={completed.quotes.has(item.id)}
                  />
                ))}
              </List>
            </TabsContent>
          )}
        </Tabs>
      </GlassCard>
    </div>
  );
}

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
    <GlassCard padding="sm" className="flex items-center justify-between gap-4">
      <p className="text-sm font-medium text-[var(--liquid-ink)]">{title}</p>

      {completed ? (
        <div className="flex items-center gap-1 text-green-600 text-sm shrink-0">
          <CheckCircle size={16} />
          Lido
        </div>
      ) : (
        <Button asChild size="sm" variant="glass-primary" className="rounded-full shrink-0">
          <Link href={href}>Ler agora</Link>
        </Button>
      )}
    </GlassCard>
  );
}
