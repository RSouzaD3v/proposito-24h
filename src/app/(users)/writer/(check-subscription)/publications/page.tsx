import { apiGet } from "@/lib/api/server";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { BookOpen, Eye, ListOrdered, Pencil } from "lucide-react";
import { WriterShell } from "@/components/ui/writer-shell";
import { PageHeader } from "@/components/ui/page-header";
import { CreateButton } from "@/components/ui/create-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { PublicationStatusBadge } from "@/components/writer/PublicationStatusBadge";

type Publication = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    status: string;
    visibility: string;
    price: number | null;
    updatedAt: string;
    _count: { chapters: number };
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

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

    const pubs = await apiGet<Publication[]>("/writer/publications");

    return (
        <WriterShell maxWidth="4xl">
            <PageHeader
                title="Minhas publicações"
                description="Escreva, organize e veja cada livro como o leitor vai ver."
                backHref="/writer/dashboard"
                backLabel="Voltar ao Painel"
                actions={
                    <>
                        <Button asChild variant="glass" className="rounded-full px-5 font-semibold">
                            <Link href="/writer/publications/my-vitrine">
                                <Eye className="size-4" /> Prévia da biblioteca
                            </Link>
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
                        className="flex gap-4 md:gap-5"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200 md:w-24">
                            {pub.coverUrl ? (
                                <img src={pub.coverUrl} alt="" className="absolute inset-0 size-full object-cover" />
                            ) : (
                                <span className="flex size-full items-center justify-center text-slate-500">
                                    <BookOpen className="size-6" aria-hidden />
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-semibold tracking-tight text-[var(--liquid-ink)]">{pub.title}</h2>
                                <PublicationStatusBadge status={pub.status} />
                            </div>
                            <p className="mt-1 text-xs text-[var(--liquid-muted)]">
                                {pub._count.chapters} {pub._count.chapters === 1 ? "capítulo" : "capítulos"}
                                {" · "}
                                {pub.visibility === "PAID" ? (pub.price ? BRL.format(pub.price / 100) : "Para assinantes") : "Gratuito"}
                                {" · "}
                                Atualizado em {new Date(pub.updatedAt).toLocaleDateString("pt-BR")}
                            </p>
                            {pub.description && (
                                <p className="mt-2 line-clamp-2 text-sm text-[var(--liquid-muted)]">{pub.description}</p>
                            )}
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <Button asChild variant="glass-primary" className="rounded-full px-4">
                                    <Link href={`/writer/publications/${pub.slug}/chapters`}>
                                        <ListOrdered className="size-4" /> Capítulos
                                    </Link>
                                </Button>
                                <Button asChild variant="glass" className="rounded-full px-4">
                                    <Link href={`/writer/publications/my-vitrine/${pub.id}`}>
                                        <Eye className="size-4" /> Prévia
                                    </Link>
                                </Button>
                                <Button asChild variant="glass" className="rounded-full px-4">
                                    <Link href={`/writer/publications/edit/${pub.id}`}>
                                        <Pencil className="size-4" /> Dados do livro
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                ))}
                {pubs.length === 0 && (
                    <GlassCard className="py-12 text-center">
                        <p className="text-lg text-[var(--liquid-muted)]">
                            Você ainda não tem publicações. Comece pelo seu primeiro livro.
                        </p>
                    </GlassCard>
                )}
            </div>
        </WriterShell>
    );
}
