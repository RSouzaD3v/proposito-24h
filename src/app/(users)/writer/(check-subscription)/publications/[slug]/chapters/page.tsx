"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateButton } from "@/components/ui/create-button";
import { GlassCard } from "@/components/ui/glass-card";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { WriterShell } from "@/components/ui/writer-shell";
import { PublicationStatusBadge } from "@/components/writer/PublicationStatusBadge";

interface Chapter {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  order: number;
}

interface Publication {
  id: string;
  slug: string;
  title: string;
  status: string;
}

const WORDS_PER_MINUTE = 200;
const plainText = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const countWords = (text: string) => (text ? text.split(" ").length : 0);

const iconButton =
  "flex size-10 items-center justify-center rounded-full text-[var(--liquid-muted)] transition-colors hover:bg-black/5 disabled:opacity-30";

export default function WriterPublicationChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [publication, setPublication] = useState<Publication | null>(null);
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const base = `/api/v1/writer/publications/${encodeURIComponent(slug)}/chapters`;

  const load = useCallback(async () => {
    const [pubs, list] = await Promise.all([fetch("/api/v1/writer/publications"), fetch(base)]);
    if (!pubs.ok || !list.ok) throw new Error();
    const all: Publication[] = await pubs.json();
    setPublication(all.find((item) => item.slug === slug) ?? null);
    setChapters(await list.json());
  }, [base, slug]);

  useEffect(() => {
    load().catch(() => setError("Não foi possível carregar os capítulos."));
  }, [load]);

  async function move(index: number, delta: number) {
    if (!chapters) return;
    const reordered = [...chapters];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(index + delta, 0, moved);
    const renumbered = reordered.map((chapter, position) => ({ ...chapter, order: position + 1 }));
    const changed = renumbered.filter((chapter) => chapters.find(({ id }) => id === chapter.id)?.order !== chapter.order);

    setBusy(true);
    setError("");
    setChapters(renumbered);
    try {
      const results = await Promise.all(
        changed.map(({ id, order }) =>
          fetch(`${base}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order }),
          }),
        ),
      );
      if (results.some((result) => !result.ok)) throw new Error();
    } catch {
      setError("Não foi possível mudar a ordem. Recarregamos a lista atual.");
      await load().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  async function remove(chapter: Chapter) {
    if (!confirm(`Apagar o capítulo "${chapter.title}"? Esta ação não pode ser desfeita.`)) return;
    setError("");
    const response = await fetch(`${base}/${chapter.id}`, { method: "DELETE" }).catch(() => null);
    if (!response?.ok) {
      setError("Não foi possível apagar o capítulo.");
      return;
    }
    setChapters((current) => current?.filter(({ id }) => id !== chapter.id) ?? null);
  }

  if (!chapters && !error) return <LoadingState variant="full" label="Carregando capítulos..." />;

  const stats = (chapters ?? []).map((chapter) => {
    const text = plainText(chapter.content);
    return { text, words: countWords(text) };
  });
  const totalWords = stats.reduce((sum, { words }) => sum + words, 0);
  const totalMinutes = Math.max(1, Math.round(totalWords / WORDS_PER_MINUTE));

  return (
    <WriterShell maxWidth="4xl">
      <PageHeader
        title={publication?.title ?? "Capítulos"}
        description={
          chapters?.length
            ? `${chapters.length} ${chapters.length === 1 ? "capítulo" : "capítulos"} · ${totalWords.toLocaleString("pt-BR")} palavras · cerca de ${totalMinutes} min de leitura`
            : "Escreva o primeiro capítulo do seu livro."
        }
        backHref="/writer/publications"
        backLabel="Voltar às Publicações"
        actions={
          <>
            {publication && (
              <Button asChild variant="glass" className="rounded-full px-5 font-semibold">
                <Link href={`/writer/publications/my-vitrine/${publication.id}`}>
                  <Eye className="size-4" /> Ver como leitor
                </Link>
              </Button>
            )}
            <CreateButton href={`/writer/publications/${slug}/chapters/new`} label="Novo capítulo" />
          </>
        }
      />

      {publication && (
        <div className="mb-4">
          <PublicationStatusBadge status={publication.status} />
        </div>
      )}
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {chapters && chapters.length > 0 ? (
        <ol className="space-y-3">
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <GlassCard strong padding="sm" className="flex items-center gap-3 md:gap-4">
                <span className="w-8 shrink-0 text-center font-serif text-xl font-bold tabular-nums text-[var(--liquid-muted)]">
                  {index + 1}
                </span>
                <Link href={`/writer/publications/${slug}/chapters/${chapter.id}`} className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-[var(--liquid-ink)]">{chapter.title}</h2>
                  <p className="truncate text-sm text-[var(--liquid-muted)]">{chapter.subtitle || stats[index].text}</p>
                  <p className="mt-0.5 text-xs tabular-nums text-[var(--liquid-muted)]">
                    {stats[index].words.toLocaleString("pt-BR")} palavras
                  </p>
                </Link>
                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    aria-label={`Subir ${chapter.title}`}
                    disabled={busy || index === 0}
                    onClick={() => move(index, -1)}
                    className={iconButton}
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Descer ${chapter.title}`}
                    disabled={busy || index === chapters.length - 1}
                    onClick={() => move(index, 1)}
                    className={iconButton}
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <Link
                    href={`/writer/publications/${slug}/chapters/${chapter.id}`}
                    aria-label={`Editar ${chapter.title}`}
                    className={iconButton}
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <button type="button" aria-label={`Apagar ${chapter.title}`} onClick={() => remove(chapter)} className={iconButton}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </GlassCard>
            </li>
          ))}
        </ol>
      ) : (
        chapters && (
          <GlassCard className="py-12 text-center">
            <p className="text-lg text-[var(--liquid-muted)]">Nenhum capítulo ainda.</p>
          </GlassCard>
        )
      )}
    </WriterShell>
  );
}
