import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";

export default async function ReaderGroupDailyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.writerId) {
    return (
      <p className="text-sm text-[var(--liquid-muted)] px-4 py-8">
        Você precisa estar logado para acessar esta área.
      </p>
    );
  }

  /**
   * 1) Buscar agrupamentos ativos do writer
   */
  const groupings = await db.groupingDaily.findMany({
    where: {
      writerId: session.user.writerId,
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  if (groupings.length === 0) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-10">
        <PageHeader title="Agrupamento de diários" backHref="/reader/area" />
        <GlassCard strong className="text-center space-y-4">
          <div className="text-4xl">📖</div>
          <h2 className="text-lg font-semibold text-[var(--liquid-ink)]">
            Nenhum agrupamento disponível
          </h2>
          <p className="text-sm text-[var(--liquid-muted)] leading-relaxed">
            Ainda não há devocionais organizados para hoje.
            Volte mais tarde ou explore outros conteúdos disponíveis.
          </p>
          <Button asChild variant="glass-primary" className="w-full rounded-full">
            <Link href="/reader/area">Voltar para a área</Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
      <PageHeader
        title="Agrupamento de diários"
        description="Separe um tempo para estar com Deus hoje"
        backHref="/reader/area"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groupings.map((group) => (
          <Link
            key={group.id}
            href={`/reader/area/group-daily/${group.id}`}
            className="group block"
          >
            <GlassCard strong padding="none" interactive className="overflow-hidden h-full">
              {group.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={group.imageUrl}
                    alt={group.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}

              <div className="space-y-2 p-4">
                <h2 className="font-semibold text-base text-[var(--liquid-ink)]">
                  {group.title}
                </h2>

                {group.description && (
                  <p className="text-sm text-[var(--liquid-muted)] line-clamp-3">
                    {group.description}
                  </p>
                )}
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
