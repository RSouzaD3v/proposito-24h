import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { BackButton } from "@/components/ui/back-button";
import { KpiStrip, PageHeader, SectionTitle } from "@/components/ledger/Ledger";
import { CHART } from "@/components/ledger/palette";
import { apiGetOrNull } from "@/lib/api/server";
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
    <section className="w-full space-y-8">
      <div>
        <BackButton href="/writer/analytics" label="Visão geral" className="mb-3" />
        <PageHeader
          eyebrow="Funil do livro"
          title={book.title}
          description="Até onde seus leitores chegaram, desde o início do registro."
          actions={
            <Link
              href={`/writer/publications/${book.slug}/chapters`}
              className="rounded-lg border border-[var(--admin-line)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--liquid-ink)] transition-colors hover:bg-[var(--admin-sunken)]"
            >
              Editar capítulos
            </Link>
          }
        />
      </div>

      <KpiStrip
        items={[
          { label: "Começaram a ler", value: INT.format(book.started), hint: "leitores neste livro" },
          { label: "Concluíram", value: INT.format(book.completed), hint: "chegaram ao último capítulo" },
          { label: "Taxa de conclusão", value: `${percent(book.completed, book.started)}%`, hint: "de quem começou" },
        ]}
      />

      <GlassCard>
        <SectionTitle
          title="Leitores por capítulo"
          description={
            lossChapter > 0
              ? `A maior queda acontece ao passar para o capítulo ${lossChapter + 1}, “${book.chapters[lossChapter].title}”.`
              : "Quantos leitores alcançaram cada capítulo."
          }
        />

        {book.started === 0 ? (
          <p className="rounded-lg bg-[var(--admin-sunken)] px-4 py-8 text-center text-sm text-[var(--liquid-muted)]">
            Ninguém começou este livro ainda. Os números aparecem assim que o primeiro leitor abrir um capítulo.
          </p>
        ) : (
          <ol className="space-y-4">
            {book.chapters.map((chapter, index) => {
              const share = percent(chapter.readers, book.started);
              const isBiggestLoss = index === lossChapter;
              return (
                <li key={chapter.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <Link
                      href={`/writer/publications/${book.slug}/chapters/${chapter.id}`}
                      className="-ml-2 inline-flex min-w-0 items-center gap-1 rounded-md px-2 py-1 text-[var(--liquid-ink)] transition-colors hover:bg-[var(--admin-sunken)]"
                    >
                      <span className="truncate">
                        {index + 1}. {chapter.title}
                      </span>
                      <ChevronRight className="size-3.5 shrink-0 opacity-60" />
                    </Link>
                    <span className="shrink-0 tabular-nums text-[var(--liquid-muted)]">
                      <strong className="font-semibold text-[var(--liquid-ink)]">{INT.format(chapter.readers)}</strong> · {share}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-[var(--admin-sunken)]">
                    <div className="h-full rounded-full" style={{ width: `${share}%`, background: CHART.primary }} />
                  </div>
                  {chapter.lost > 0 && (
                    <p className={isBiggestLoss ? "mt-1 text-xs font-medium text-[var(--admin-bad)]" : "mt-1 text-xs text-[var(--liquid-muted)]"}>
                      {INT.format(chapter.lost)} {chapter.lost === 1 ? "parou" : "pararam"} antes deste capítulo
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </GlassCard>
    </section>
  );
}
