import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { ModalGroupDaily } from "./_components/ModalGroupDaily";
import { WriterShell } from "@/components/ui/writer-shell";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";

export default async function GroupDaily() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.writerId) {
    return (
      <WriterShell maxWidth="4xl">
        <p className="text-sm text-[var(--liquid-muted)]">
          Você precisa estar logado para acessar esta página.
        </p>
      </WriterShell>
    );
  }

  const groupingDailies = await db.groupingDaily.findMany({
    where: {
      writerId: session.user.writerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <WriterShell maxWidth="4xl">
      <PageHeader
        title="Agrupamentos Diários"
        description="Organize os conteúdos do seu devocional diário"
        backHref="/writer/dashboard"
        actions={<ModalGroupDaily />}
      />

      {groupingDailies.length === 0 && (
        <GlassCard strong className="mx-auto max-w-md text-center space-y-4">
          <h2 className="text-lg font-semibold text-[var(--liquid-ink)]">
            Nenhum agrupamento criado
          </h2>
          <p className="text-sm text-[var(--liquid-muted)]">
            Você ainda não criou um agrupamento diário. Crie um para organizar
            seus devocionais.
          </p>
          <div className="flex justify-center">
            <ModalGroupDaily />
          </div>
        </GlassCard>
      )}

      {groupingDailies.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groupingDailies.map((group) => (
            <GlassCard key={group.id} strong padding="none" className="overflow-hidden">
              {group.imageUrl && (
                <div className="h-40 w-full overflow-hidden">
                  <img
                    src={group.imageUrl}
                    alt={group.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-3 p-4">
                <div>
                  <h3 className="text-base font-semibold text-[var(--liquid-ink)]">
                    {group.title}
                  </h3>
                  {group.description && (
                    <p className="mt-1 line-clamp-3 text-sm text-[var(--liquid-muted)]">
                      {group.description}
                    </p>
                  )}
                </div>
                <Button asChild variant="glass-primary" className="w-full gap-2 rounded-full">
                  <Link href={`/writer/group-daily/${group.id}`}>
                    <Pencil size={16} />
                    Entrar / Editar agrupamento
                  </Link>
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </WriterShell>
  );
}
