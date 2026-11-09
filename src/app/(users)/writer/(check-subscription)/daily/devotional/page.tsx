import { apiGet } from "@/lib/api/server";
import Link from "next/link";
import { WriterShell } from "@/components/ui/writer-shell";
import { PageHeader } from "@/components/ui/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { CreateButton } from "@/components/ui/create-button";
import { Button } from "@/components/ui/button";

export default async function DevotionalPage() {
    const { item: devotional } = await apiGet<{ item: any }>("/writer/daily/devotional/today");

    return (
        <WriterShell maxWidth="xl">
            <PageHeader
                title="Devocional do Dia"
                backHref="/writer/daily"
                actions={
                    <>
                        {devotional && (
                            <Button asChild variant="glass" className="rounded-full px-4">
                                <Link href={`/writer/daily/devotional/edit/${devotional.id}`}>
                                    Editar
                                </Link>
                            </Button>
                        )}
                        <CreateButton href="/writer/daily/devotional/new" label="Novo" />
                    </>
                }
            />

            {devotional ? (
                <GlassCard strong className="text-center">
                    <h2 className="mb-4 text-xs font-semibold tracking-widest text-[var(--liquid-accent)]">
                        PROPÓSITO 24H
                    </h2>
                    <span className="mb-2 block text-sm font-semibold text-[var(--liquid-muted)]">
                        {devotional.title}
                    </span>
                    <blockquote className="mb-6">
                        <p className="whitespace-pre-line text-2xl font-light italic leading-relaxed text-[var(--liquid-ink)]">
                            “{devotional.content}”
                        </p>
                    </blockquote>
                </GlassCard>
            ) : (
                <GlassCard strong className="text-center">
                    <p className="mb-4 text-[var(--liquid-muted)]">Nenhum devocional criado hoje.</p>
                    <CreateButton href="/writer/daily/devotional/new" label="Criar Novo Devocional" />
                </GlassCard>
            )}
        </WriterShell>
    );
}
