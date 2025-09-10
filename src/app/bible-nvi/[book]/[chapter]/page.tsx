// app/bible-nvi/[book]/[chapter]/page.tsx
import Link from "next/link";
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

      <div className="mb-4 flex items-center gap-2">
        {nav.prev ? (
          <Link className="rounded-md border px-3 py-2 text-black bg-gray-100 hover:bg-gray-200" href={`/bible-nvi/${b.abbrev}/${nav.prev}`}>
            ← Cap. {nav.prev}
          </Link>
        ) : <span className="rounded-md border text-black px-3 py-2 opacity-50">← Cap. —</span>}
        <Link className="rounded-md text-black border px-3 py-2 bg-gray-100 hover:bg-gray-200" href={`/bible-nvi/${b.abbrev}`}>Capítulos</Link>
        {nav.next ? (
          <Link className="rounded-md border text-black px-3 py-2 bg-gray-100 hover:bg-gray-200" href={`/bible-nvi/${b.abbrev}/${nav.next}`}>
            Cap. {nav.next} →
          </Link>
        ) : <span className="rounded-md border px-3 py-2 opacity-50">Cap. — →</span>}
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

      <div className="mt-6 flex items-center gap-2">
        {nav.prev ? (
          <Link className="rounded-md border px-3 py-2 text-black bg-gray-100 hover:bg-gray-200" href={`/bible-nvi/${b.abbrev}/${nav.prev}`}>
            ← Cap. {nav.prev}
          </Link>
        ) : <span className="rounded-md border px-3 py-2 opacity-50">← Cap. —</span>}
        <Link className="rounded-md border px-3 py-2 text-black bg-gray-100 hover:bg-gray-200" href={`/bible-nvi/${b.abbrev}`}>Capítulos</Link>
        {nav.next ? (
          <Link className="rounded-md border px-3 py-2 text-black bg-gray-100 hover:bg-gray-200" href={`/bible-nvi/${b.abbrev}/${nav.next}`}>
            Cap. {nav.next} →
          </Link>
        ) : <span className="rounded-md border px-3 py-2 opacity-50">Cap. — →</span>}
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Link href={`/bible-acf/${b.abbrev}/${cap}`} className="text-sm underline">Ver este capítulo em ACF</Link>
      </div>
    </section>
  );
}
