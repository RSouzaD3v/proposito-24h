import DailyTabs from "./_components/DailyTabs";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet } from "@/lib/api/server";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 10;

interface ContentPage {
  items: any[];
  total: number;
}

export default async function DailyPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab ?? "verses";
  const page = Number((await searchParams).page ?? "1");
  const list = (kind: string) => apiGet<ContentPage>(`/reader/content/${kind}?page=${page}`);

  const [verses, devotionals, quotes, prayers] = await Promise.all([
    list("verse"),
    list("devotional"),
    list("quote"),
    list("prayer"),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PageHeader
        title="Diário"
        description="Conteúdos diários organizados por data"
        backHref="/reader/area"
      />

      <GlassCard strong padding="md">
        <DailyTabs
          tab={tab}
          page={page}
          pageSize={PAGE_SIZE}
          data={{
            verses: verses.items,
            devotionals: devotionals.items,
            quotes: quotes.items,
            prayers: prayers.items,
          }}
          total={{
            verses: verses.total,
            devotionals: devotionals.total,
            quotes: quotes.total,
            prayers: prayers.total,
          }}
        />
      </GlassCard>
    </div>
  );
}
