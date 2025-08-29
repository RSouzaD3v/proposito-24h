import Link from "next/link";
import { getBookByAbbrev, getChaptersOfBook } from "@/lib/bible";

type RouteParams = { book: string };

export async function generateMetadata({ params }: { params: Promise<RouteParams> }) {
  const { book } = await params;
  const b = await getBookByAbbrev(book);
  return { title: b ? `${b.name} — Capítulos` : "Livro não encontrado" };
}

export default async function BookChaptersPage({ params }: { params: Promise<RouteParams> }) {
  const { book } = await params;
  const b = await getBookByAbbrev(book);
  if (!b) return <div className="text-red-600">Livro não encontrado.</div>;

  const chapters = await getChaptersOfBook(book);

  return (
    <section className="min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{b.name}</h2>
        <p className="text-sm text-muted-foreground">Escolha um capítulo</p>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {chapters.map((c) => (
          <Link key={c} href={`/reader/area/bible/${b.abbrev}/${c}`} className="rounded-md bg-gray-100 hover:bg-gray-200 border px-3 py-2 hover:text-propositoGray text-center hover:bg-accent">
            {c}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Link href="/reader/area/bible" className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">← todos os livros</Link>
      </div>
    </section>
  );
}
