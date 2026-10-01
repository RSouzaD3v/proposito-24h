import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { WriterShell } from "@/components/ui/writer-shell";
import { PageHeader } from "@/components/ui/page-header";
import { CreateButton } from "@/components/ui/create-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export default async function WriterPublicationPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user.writerId) {
        return (
            <WriterShell maxWidth="2xl">
                <GlassCard className="text-center">
                    <p className="text-lg font-medium text-red-600">
                        Acesso negado. Por favor, faça login.
                    </p>
                </GlassCard>
            </WriterShell>
        );
    }

    const pubs = await db.publication.findMany({
        where: {
            writerId: session?.user?.writerId,
        },
    });

    return (
        <WriterShell maxWidth="4xl">
            <PageHeader
                title="Painel de Publicações"
                description="Gerencie suas publicações de forma fácil e rápida."
                backHref="/writer/dashboard"
                backLabel="Voltar ao Painel"
                actions={
                    <>
                        <Button asChild variant="glass" className="rounded-full px-5 font-semibold">
                            <Link href="/writer/publications/my-vitrine">Minha Vitrine</Link>
                        </Button>
                        <CreateButton href="/writer/publications/create" label="Nova Publicação" />
                    </>
                }
            />

            <div className="space-y-4">
                {pubs.map((pub, index) => (
                    <GlassCard
                        key={pub.id}
                        strong
                        interactive
                        className="animate-glass-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <h2 className="text-xl font-semibold tracking-tight text-[var(--liquid-ink)] md:text-2xl">
                            {pub.title}
                        </h2>
                        <p className="mt-2 text-[var(--liquid-muted)]">{pub.description}</p>
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <Button asChild variant="glass-primary" className="rounded-full px-4">
                                <Link href={`/writer/publications/edit/${pub.id}`}>Editar</Link>
                            </Button>
                            <Button asChild variant="glass" className="rounded-full px-4">
                                <Link href={`/writer/publications/${pub.slug}/chapters`}>
                                    Ver Capítulos
                                </Link>
                            </Button>
                        </div>
                    </GlassCard>
                ))}
                {pubs.length === 0 && (
                    <GlassCard className="py-12 text-center">
                        <p className="text-lg text-[var(--liquid-muted)]">
                            Nenhuma publicação encontrada.
                        </p>
                    </GlassCard>
                )}
            </div>
        </WriterShell>
    );
}
