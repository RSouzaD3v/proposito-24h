// app/(public)/bible/[book]/[chapter]/page.tsx
import Link from "next/link";
import { getBookByAbbrev, getPrevNextChapter, getVerses } from "@/lib/bible";

interface Props { params: { book: string; chapter: string } }

export async function generateMetadata({ params }: Props) {
  const book = await getBookByAbbrev(params.book);
  const cap = Number(params.chapter);
  return {
    title: book ? `${book.name} ${cap} — Versículos` : "Capítulo",
  };
}

export default async function ChapterVersesPage({ params }: Props) {
  const chapter = Number(params.chapter);
  const { book, verses } = await getVerses(params.book, chapter);
  if (!book) return <div className="text-red-600">Livro não encontrado.</div>;

  const nav = await getPrevNextChapter(params.book, chapter);

  return (
    <section>
      <header className="mb-4">
        <h2 className="text-2xl font-semibold">{book.name} {chapter}</h2>
        <p className="text-sm text-muted-foreground">ACF</p>
      </header>

      {/* Navegação anterior/próximo */}
      <div className="mb-4 flex items-center gap-2">
        {nav.prev ? (
          <Link className="rounded-md border px-3 py-2" href={`/reader/area/bible/${book.abbrev}/${nav.prev}`}>
            ← Cap. {nav.prev}
          </Link>
        ) : (
          <span className="rounded-md border px-3 py-2 opacity-50">← Cap. —</span>
        )}
        <Link className="rounded-md border px-3 py-2" href={`/reader/area/bible/${book.abbrev}`}>Capítulos</Link>
        {nav.next ? (
          <Link className="rounded-md border px-3 py-2" href={`/reader/area/bible/${book.abbrev}/${nav.next}`}>
            Cap. {nav.next} →
          </Link>
        ) : (
          <span className="rounded-md border px-3 py-2 opacity-50">Cap. — →</span>
        )}
      </div>

      {/* Lista de versículos */}
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

      {/* repetição da navegação no fim */}
      <div className="mt-6 flex items-center gap-2">
        {nav.prev ? (
          <Link className="rounded-md border px-3 py-2" href={`/reader/area/bible/${book.abbrev}/${nav.prev}`}>
            ← Cap. {nav.prev}
          </Link>
        ) : (
          <span className="rounded-md border px-3 py-2 opacity-50">← Cap. —</span>
        )}
        <Link className="rounded-md border px-3 py-2" href={`/reader/area/bible/${book.abbrev}`}>Capítulos</Link>
        {nav.next ? (
          <Link className="rounded-md border px-3 py-2" href={`/reader/area/bible/${book.abbrev}/${nav.next}`}>
            Cap. {nav.next} →
          </Link>
        ) : (
          <span className="rounded-md border px-3 py-2 opacity-50">Cap. — →</span>
        )}
      </div>

      <div className="mt-6">
        <Link href="/reader/area/bible" className="text-sm text-primary underline">← todos os livros</Link>
      </div>
    </section>
  );
}