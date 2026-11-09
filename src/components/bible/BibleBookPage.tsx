import { notFound } from "next/navigation";
import { getBookByAbbrev, getChaptersOfBook } from "@/lib/bible";
import { BibleTopBar, VersionSwitch } from "./BibleChrome";
import { ChapterGrid } from "./ChapterGrid";
import { biblePath, type BibleVersionCode } from "./bible-books";

export async function BibleBookPage({ version, abbrev }: { version: BibleVersionCode; abbrev: string }) {
  const book = await getBookByAbbrev(abbrev);
  if (!book) notFound();
  const chapters = await getChaptersOfBook(book.abbrev, version);

  return (
    <>
      <BibleTopBar backHref={biblePath(version)} backLabel="Todos os livros" title="Livros">
        <VersionSwitch current={version} hrefFor={(code) => biblePath(code, book.abbrev)} />
      </BibleTopBar>
      <h1 className="text-[2rem] leading-tight text-[var(--liquid-ink)]">{book.name}</h1>
      <p className="mt-1 mb-6 text-sm text-[var(--liquid-muted)]">
        {chapters.length} {chapters.length === 1 ? "capítulo" : "capítulos"} · escolha por onde começar
      </p>
      <ChapterGrid version={version} abbrev={book.abbrev} chapters={chapters} />
    </>
  );
}
