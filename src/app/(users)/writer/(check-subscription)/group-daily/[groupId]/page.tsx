import { apiGetOrNull } from "@/lib/api/server";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent } from "@/components/ui/card";
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

  const manager = await apiGetOrNull<any>(`/writer/groupings/${groupId}`);
  if (!manager) notFound();
  const { grouping, devotionals, quotes, prayers, verses } = manager;

  // 3) Sets para UI saber o que já está adicionado
  const groupedIds = {
    devotionals: new Set<string>(grouping.devotionals.map((d: { id: string }) => d.id)),
    quotes: new Set<string>(grouping.quotes.map((q: { id: string }) => q.id)),
    prayers: new Set<string>(grouping.prayers.map((p: { id: string }) => p.id)),
    verses: new Set<string>(grouping.verses.map((v: { id: string }) => v.id)),
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
        
          <BackButton href="/writer/group-daily" />
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
