import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { BackButton } from "@/components/ui/back-button";
import { apiGetOrNull } from "@/lib/api/server";
import { KpiTile } from "@/components/writer/KpiTile";
import { INT } from "../../_lib/insights";

type Funnel = {
  id: string;
  title: string;
  slug: string;
  started: number;
  completed: number;
  chapters: { id: string; title: string; readers: number; lost: number }[];
};

const percent = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

export default async function BookFunnelPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const book = await apiGetOrNull<Funnel>(`/writer/analytics/books/${encodeURIComponent(bookId)}/funnel`);
  if (!book) notFound();

  const biggestLoss = Math.max(0, ...book.chapters.map(({ lost }) => lost));
  const lossChapter = book.chapters.findIndex(({ lost }) => lost === biggestLoss && lost > 0);

  return (
    <section className="w-full space-y-6">
      <header>
        <BackButton href="/writer/analytics" label="Insights" className="mb-3" />
        <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">{book.title}</h1>
        <p className="text-sm text-[var(--liquid-muted)]">Até onde seus leitores chegaram, desde o início do registro.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiTile label="Começaram a ler" value={INT.format(book.started)} hint="leitores neste livro" />
        <KpiTile label="Concluíram" value={INT.format(book.completed)} hint="chegaram ao último capítulo" />
        <KpiTile label="Taxa de conclusão" value={`${percent(book.completed, book.started)}%`} hint="de quem começou" />
      </div>

      <GlassCard strong>
        <h2 className="font-semibold text-[var(--liquid-ink)]">Leitores por capítulo</h2>
        {lossChapter > 0 && (
          <p className="mt-1 text-sm text-[var(--liquid-muted)]">
            A maior queda acontece ao passar para o capítulo {lossChapter + 1}, “{book.chapters[lossChapter].title}”.
          </p>
        )}

        {book.started === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--liquid-muted)]">
            Ninguém começou este livro ainda. Os números aparecem assim que o primeiro leitor abrir um capítulo.
          </p>
        ) : (
          <ol className="mt-4 space-y-4">
            {book.chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <Link href={`/writer/publications/${book.slug}/chapters/${chapter.id}`} className="min-w-0 truncate text-[var(--liquid-ink)] hover:underline">
                    {index + 1}. {chapter.title}
                  </Link>
                  <span className="shrink-0 tabular-nums text-[var(--liquid-muted)]">
                    <strong className="font-semibold text-[var(--liquid-ink)]">{INT.format(chapter.readers)}</strong> · {percent(chapter.readers, book.started)}%
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-black/5">
                  <div className="h-full rounded-full bg-[#2a78d6]" style={{ width: `${percent(chapter.readers, book.started)}%` }} />
                </div>
                {chapter.lost > 0 && (
                  <p className="mt-1 text-xs text-[var(--liquid-muted)]">
                    {INT.format(chapter.lost)} {chapter.lost === 1 ? "parou" : "pararam"} antes deste capítulo
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </GlassCard>
    </section>
  );
}
