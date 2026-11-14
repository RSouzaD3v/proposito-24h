// app/bible-nvi/[book]/[chapter]/page.tsx
import Link from "next/link";
import { ArrowLeftRight, ChevronLeft, ChevronRight, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { getBookByAbbrev, getPrevNextChapter, getVerses } from "@/lib/bible";

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
    <section className="min-h-screen">
      <header className="mb-4">
        <h2 className="text-2xl font-semibold">{b.name} {cap}</h2>
        <p className="text-sm text-muted-foreground">NVI</p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {nav.prev ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/bible-nvi/${b.abbrev}/${nav.prev}`}>
              <ChevronLeft />
              Cap. {nav.prev}
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="rounded-full" disabled>
            <ChevronLeft />
            Cap. —
          </Button>
        )}
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/bible-nvi/${b.abbrev}`}>
            <List />
            Capítulos
          </Link>
        </Button>
        {nav.next ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/bible-nvi/${b.abbrev}/${nav.next}`}>
              Cap. {nav.next}
              <ChevronRight />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="rounded-full" disabled>
            Cap. —
            <ChevronRight />
          </Button>
        )}
      </div>

      <ol className="space-y-3">
        {verses.map((v) => (
          <li key={v.verse} id={`v${v.verse}`} className="scroll-mt-24">
            <div className="flex gap-3">
              <span className="select-none shrink-0 rounded-full border px-2 text-sm leading-6">{v.verse}</span>
              <p className="leading-7">{v.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {nav.prev ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/bible-nvi/${b.abbrev}/${nav.prev}`}>
              <ChevronLeft />
              Cap. {nav.prev}
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="rounded-full" disabled>
            <ChevronLeft />
            Cap. —
          </Button>
        )}
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/bible-nvi/${b.abbrev}`}>
            <List />
            Capítulos
          </Link>
        </Button>
        {nav.next ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/bible-nvi/${b.abbrev}/${nav.next}`}>
              Cap. {nav.next}
              <ChevronRight />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="rounded-full" disabled>
            Cap. —
            <ChevronRight />
          </Button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <BackButton href="/bible-nvi" label="Todos os livros" />
        <Button asChild variant="ghost" className="rounded-full">
          <Link href={`/bible-acf/${b.abbrev}/${cap}`}>
            <ArrowLeftRight />
            Ver este capítulo em ACF
          </Link>
        </Button>
      </div>
    </section>
  );
}
