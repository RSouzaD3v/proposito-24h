import Link from "next/link";
import { getBookByAbbrev, getPrevNextChapter, getVerses } from "@/lib/bible";
import TTSReader from "@/components/TTSReader";
import NativeReaderAudio from "@/components/NativeReaderAudio";

type RouteParams = { book: string; chapter: string };

export async function generateMetadata({ params }: { params: Promise<RouteParams> }) {
  const { book, chapter } = await params;
  const b = await getBookByAbbrev(book);
  const cap = Number(chapter);
  return { title: b ? `${b.name} ${cap} — Versículos` : "Capítulo" };
}

export default async function ChapterVersesPage({ params }: { params: Promise<RouteParams> }) {
  const { book, chapter } = await params;
  const cap = Number(chapter);

  const { book: b, verses } = await getVerses(book, cap);
  if (!b) return <div className="text-red-600">Livro não encontrado.</div>;

  const nav = await getPrevNextChapter(book, cap);

  return (
    <section className="min-h-screen">
      <header className="mb-4">
        <h2 className="text-2xl font-semibold">{b.name} {cap}</h2>
        <p className="text-sm text-muted-foreground">ACF</p>
              <NativeReaderAudio text={verses.map(v => v.text).join(' ')} />
              <p></p>
      </header>

      <div className="mb-4 flex items-center gap-2">
        {nav.prev ? (
          <Link className="rounded-md border px-3 py-2 text-black bg-gray-100 hover:bg-gray-200" href={`/reader/area/bible-acf/${b.abbrev}/${nav.prev}`}>
            ← Cap. {nav.prev}
          </Link>
        ) : <span className="rounded-md border text-black px-3 py-2 opacity-50">← Cap. —</span>}
        <Link className="rounded-md text-black border px-3 py-2 bg-gray-100 hover:bg-gray-200" href={`/reader/area/bible-acf/${b.abbrev}`}>Capítulos</Link>
        {nav.next ? (
          <Link className="rounded-md border text-black px-3 py-2 bg-gray-100 hover:bg-gray-200" href={`/reader/area/bible-acf/${b.abbrev}/${nav.next}`}>
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

      {/* <TTSReader text={verses.map(v => v.text).join(' ')} /> */}

      <div className="mt-6 flex items-center gap-2">
        {nav.prev ? (
          <Link className="rounded-md border px-3 py-2 text-black bg-gray-100 hover:bg-gray-200" href={`/reader/area/bible-acf/${b.abbrev}/${nav.prev}`}>
            ← Cap. {nav.prev}
          </Link>
        ) : <span className="rounded-md border px-3 py-2 opacity-50">← Cap. —</span>}
        <Link className="rounded-md border px-3 py-2 text-black bg-gray-100 hover:bg-gray-200" href={`/reader/area/bible-acf/${b.abbrev}`}>Capítulos</Link>
        {nav.next ? (
          <Link className="rounded-md border px-3 py-2 text-black bg-gray-100 hover:bg-gray-200" href={`/reader/area/bible-acf/${b.abbrev}/${nav.next}`}>
            Cap. {nav.next} →
          </Link>
        ) : <span className="rounded-md border px-3 py-2 opacity-50">Cap. — →</span>}
      </div>

      <div className="mt-6">
        <Link href="/reader/area/bible-acf" className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">← todos os livros</Link>
      </div>
    </section>
  );
}
