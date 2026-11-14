// app/bible-nvi/[book]/page.tsx
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { getBookByAbbrev, getChaptersOfBook } from "@/lib/bible";

type RouteParams = { book: string };

export async function generateMetadata({ params }: { params: Promise<RouteParams> }) {
  const { book } = await params;
  const b = await getBookByAbbrev(book);
  return { title: b ? `${b.name} — Capítulos (NVI)` : "Livro não encontrado" };
}

export default async function BookChaptersPageNVI({ params }: { params: Promise<RouteParams> }) {
  const { book } = await params;
  const b = await getBookByAbbrev(book);
  if (!b) return <div className="text-red-600">Livro não encontrado.</div>;

  const chapters = await getChaptersOfBook(book, "NVI");

  return (
    <section className="min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{b.name} — NVI</h2>
        <p className="text-sm text-muted-foreground">Escolha um capítulo</p>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {chapters.map((c) => (
          <Link
            key={c}
            href={`/bible-nvi/${b.abbrev}/${c}`}
            className="rounded-md text-black bg-gray-100 hover:bg-gray-200 border px-3 py-2 hover:text-propositoGray text-center"
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <BackButton href="/bible-nvi" label="Todos os livros (NVI)" />
        <Button asChild variant="ghost" className="rounded-full">
          <Link href={`/bible-acf/${b.abbrev}`}>
            <ArrowLeftRight />
            Ver este livro em ACF
          </Link>
        </Button>
      </div>
    </section>
  );
}
