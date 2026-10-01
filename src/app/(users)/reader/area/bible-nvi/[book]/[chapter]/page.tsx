import Link from "next/link";
import { getBookByAbbrev, getPrevNextChapter, getVerses } from "@/lib/bible";
import TeacherBibleAI from "@/components/TeacherBibleAi";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

type RouteParams = { book: string; chapter: string };

export async function generateMetadata({ params }: { params: Promise<RouteParams> }) {
  const { book, chapter } = await params;
  const b = await getBookByAbbrev(book);
  const cap = Number(chapter);
  return { title: b ? `${b.name} ${cap} — Versículos (NVI)` : "Capítulo (NVI)" };
}

export default async function ChapterVersesPageNVI({ params }: { params: Promise<RouteParams> }) {
  const { book, chapter } = await params;
  const cap = Number(chapter);

  const { book: b, verses } = await getVerses(book, cap, "NVI");
  if (!b) return <div className="text-red-600">Livro não encontrado.</div>;

  const nav = await getPrevNextChapter(book, cap, "NVI");

  return (
    <section className="min-h-screen pb-8">
      <TeacherBibleAI />
      <header className="mb-4">
        <h2 className="text-2xl font-semibold text-[var(--liquid-ink)]">
          {b.name} {cap}
        </h2>
        <p className="text-sm text-[var(--liquid-muted)]">NVI</p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {nav.prev ? (
          <Button asChild variant="glass" size="sm" className="rounded-full">
            <Link href={`/reader/area/bible-nvi/${b.abbrev}/${nav.prev}`}>
              ← Cap. {nav.prev}
            </Link>
          </Button>
        ) : (
          <span className="rounded-full border border-white/50 px-3 py-2 text-sm opacity-50">
            ← Cap. —
          </span>
        )}
        <Button asChild variant="glass" size="sm" className="rounded-full">
          <Link href={`/reader/area/bible-nvi/${b.abbrev}`}>Capítulos</Link>
        </Button>
        {nav.next ? (
          <Button asChild variant="glass" size="sm" className="rounded-full">
            <Link href={`/reader/area/bible-nvi/${b.abbrev}/${nav.next}`}>
              Cap. {nav.next} →
            </Link>
          </Button>
        ) : (
          <span className="rounded-full border border-white/50 px-3 py-2 text-sm opacity-50">
            Cap. — →
          </span>
        )}
      </div>

      <GlassCard strong className="mb-6">
        <ol className="space-y-3">
          {verses.map((v) => (
            <li key={v.verse} id={`v${v.verse}`} className="scroll-mt-24">
              <div className="flex gap-3">
                <span className="shrink-0 select-none rounded-full border border-white/60 bg-white/50 px-2 text-sm leading-6">
                  {v.verse}
                </span>
                <p className="leading-7 text-[var(--liquid-ink)]">{v.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </GlassCard>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {nav.prev ? (
          <Button asChild variant="glass" size="sm" className="rounded-full">
            <Link href={`/reader/area/bible-nvi/${b.abbrev}/${nav.prev}`}>
              ← Cap. {nav.prev}
            </Link>
          </Button>
        ) : (
          <span className="rounded-full border border-white/50 px-3 py-2 text-sm opacity-50">
            ← Cap. —
          </span>
        )}
        <Button asChild variant="glass" size="sm" className="rounded-full">
          <Link href={`/reader/area/bible-nvi/${b.abbrev}`}>Capítulos</Link>
        </Button>
        {nav.next ? (
          <Button asChild variant="glass" size="sm" className="rounded-full">
            <Link href={`/reader/area/bible-nvi/${b.abbrev}/${nav.next}`}>
              Cap. {nav.next} →
            </Link>
          </Button>
        ) : (
          <span className="rounded-full border border-white/50 px-3 py-2 text-sm opacity-50">
            Cap. — →
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="glass" className="rounded-full">
          <Link href={`/reader/area/bible-acf/${b.abbrev}/${cap}`}>
            Ver em ACF
          </Link>
        </Button>
        <BackButton href="/reader/area/bible-nvi" label="Livros (NVI)" />
      </div>
    </section>
  );
}
