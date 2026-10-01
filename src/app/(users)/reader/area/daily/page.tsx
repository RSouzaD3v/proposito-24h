import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

import DailyTabs from "./_components/DailyTabs";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 10;

export default async function DailyPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const writerId = (session.user as any)?.writerId;
  if (!writerId) redirect("/");

  const tab = (await searchParams).tab ?? "verses";
  const page = Number((await searchParams).page ?? "1");
  const skip = (page - 1) * PAGE_SIZE;

  const commonQuery = {
    where: { writerId },
    orderBy: { createdAt: "desc" as const },
    take: PAGE_SIZE,
    skip,
  };

  const [verses, devotionals, quotes, prayers] = await Promise.all([
    db.verse.findMany(commonQuery),
    db.devotional.findMany(commonQuery),
    db.quote.findMany(commonQuery),
    db.prayer.findMany(commonQuery)
  ]);

  const [versesCount, devotionalsCount, quotesCount, prayersCount] =
    await Promise.all([
      db.verse.count({ where: { writerId } }),
      db.devotional.count({ where: { writerId } }),
      db.quote.count({ where: { writerId } }),
      db.prayer.count({ where: { writerId } })
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
            verses,
            devotionals,
            quotes,
            prayers
          }}
          total={{
            verses: versesCount,
            devotionals: devotionalsCount,
            quotes: quotesCount,
            prayers: prayersCount
          }}
        />
      </GlassCard>
    </div>
  );
}
