import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { GroupingContentManager } from "./_components/GroupingContentManager";
import { ModalEditGroupDaily } from "../_components/ModalEditGroupDaily";


interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function GroupDailyDetailPage({ params }: PageProps) {
  const { groupId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.writerId) {
    return (
      <p className="text-sm text-muted-foreground">
        Você precisa estar logado.
      </p>
    );
  }

  // 1) Grouping (com ids já conectados)
  const grouping = await db.groupingDaily.findFirst({
    where: {
      id: groupId,
      writerId: session.user.writerId,
    },
    include: {
      devotionals: { select: { id: true } },
      quotes: { select: { id: true } },
      prayers: { select: { id: true } },
      verses: { select: { id: true } },
    },
  });

  if (!grouping) notFound();

  // 2) Buscar todos os conteúdos do writer
  const [devotionals, quotes, prayers, verses] = await Promise.all([
    db.devotional.findMany({
      where: { writerId: session.user.writerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        verse: true,
        imageUrl: true,
        createdAt: true,
      },
    }),
    db.quote.findMany({
      where: { writerId: session.user.writerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nameAuthor: true,
        content: true,
        verse: true,
        imageUrl: true,
        createdAt: true,
      },
    }),
    db.prayer.findMany({
      where: { writerId: session.user.writerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        createdAt: true,
      },
    }),
    db.verse.findMany({
      where: { writerId: session.user.writerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        reference: true,
        imageUrl: true,
        createdAt: true,
      },
    }),
  ]);

  // 3) Sets para UI saber o que já está adicionado
  const groupedIds = {
    devotionals: new Set(grouping.devotionals.map((d) => d.id)),
    quotes: new Set(grouping.quotes.map((q) => q.id)),
    prayers: new Set(grouping.prayers.map((p) => p.id)),
    verses: new Set(grouping.verses.map((v) => v.id)),
  };

  return (
    <div className="space-y-6 mt-5 max-w-5xl mx-auto px-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{grouping.title}</h1>
          {grouping.description && (
            <p className="text-sm text-muted-foreground">
              {grouping.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ModalEditGroupDaily
            initialActive={grouping.active}
            groupId={grouping.id}
            initialTitle={grouping.title}
            initialDescription={grouping.description}
            initialImageUrl={grouping.imageUrl}
          />
        
          <Button asChild variant="outline">
            <Link href="/writer/group-daily" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      {/* Resumo rápido */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Citações" value={groupedIds.quotes.size} />
        <SummaryCard title="Devocionais" value={groupedIds.devotionals.size} />
        <SummaryCard title="Orações" value={groupedIds.prayers.size} />
        <SummaryCard title="Versículos" value={groupedIds.verses.size} />
      </div>

      {/* Manager (client) — Passo 2 vai criar este componente */}
      <GroupingContentManager
        groupId={groupId}
        devotionals={devotionals}
        quotes={quotes}
        prayers={prayers}
        verses={verses}
        groupedIds={{
          devotionals: Array.from(groupedIds.devotionals),
          quotes: Array.from(groupedIds.quotes),
          prayers: Array.from(groupedIds.prayers),
          verses: Array.from(groupedIds.verses),
        }}
      />
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 text-center space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
