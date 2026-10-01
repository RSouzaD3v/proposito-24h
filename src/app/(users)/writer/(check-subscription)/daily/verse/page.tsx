import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { WriterShell } from "@/components/ui/writer-shell";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { CreateButton } from "@/components/ui/create-button";
import { Button } from "@/components/ui/button";

export default async function VersePage() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.writerId) return null;

    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const verse = await db.verse.findFirst({
        where: {
            writerId: user.writerId,
            createdAt: { gte: start, lt: end }
        }
    });

    return (
        <WriterShell maxWidth="xl">
            <PageHeader
                title="Versículo do Dia"
                backHref="/writer/daily"
                actions={
                    <>
                        {verse && (
                            <Button asChild variant="glass" className="rounded-full px-4">
                                <Link href={`/writer/daily/verse/edit/${verse.id}`}>Editar</Link>
                            </Button>
                        )}
                        <CreateButton href="/writer/daily/verse/new" label="Novo" />
                    </>
                }
            />

            {verse ? (
                <GlassCard strong className="text-center">
                    <h2 className="mb-4 text-xs font-semibold tracking-widest text-[var(--liquid-accent)]">
                        PROPÓSITO 24H
                    </h2>
                    <blockquote className="mb-6">
                        <p className="text-2xl font-light italic text-[var(--liquid-ink)]">
                            “{verse.content}”
                        </p>
                    </blockquote>
                    <span className="text-sm font-semibold text-[var(--liquid-muted)]">
                        {verse.reference}
                    </span>
                </GlassCard>
            ) : (
                <GlassCard strong className="text-center">
                    <p className="mb-4 text-[var(--liquid-muted)]">Nenhuma passagem criada hoje.</p>
                    <CreateButton href="/writer/daily/verse/new" label="Criar Nova Passagem" />
                </GlassCard>
            )}
        </WriterShell>
    );
}
