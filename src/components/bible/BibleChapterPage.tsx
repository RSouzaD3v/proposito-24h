import { notFound } from "next/navigation";
import { getBooks, getChapter, getChaptersOfBook } from "@/lib/bible";
import { ChapterReader, type ChapterLink } from "./ChapterReader";
import { biblePath, type BibleVersionCode } from "./bible-books";

export async function BibleChapterPage({
  version,
  abbrev,
  chapter,
}: {
  version: BibleVersionCode;
  abbrev: string;
  chapter: number;
}) {
  const [data, books, chapters] = await Promise.all([
    getChapter(abbrev, chapter, version),
    getBooks(),
    getChaptersOfBook(abbrev, version),
  ]);
  if (!data) notFound();

  // No fim de um livro, a navegação segue para o próximo (ou anterior) livro.
  const index = books.findIndex((book) => book.abbrev === data.book.abbrev);
  const link = (abbrevTo: string, name: string, chapterTo: number): ChapterLink => ({
    href: biblePath(version, abbrevTo, chapterTo),
    label: `${name} ${chapterTo}`,
  });
  const prevBook = books[index - 1];
  const nextBook = books[index + 1];
  const prevChapters = !data.prev && prevBook ? await getChaptersOfBook(prevBook.abbrev, version) : [];

  const prev = data.prev
    ? link(data.book.abbrev, data.book.name, data.prev)
    : prevBook && prevChapters.length
      ? link(prevBook.abbrev, prevBook.name, prevChapters[prevChapters.length - 1])
      : null;
  const next = data.next
    ? link(data.book.abbrev, data.book.name, data.next)
    : nextBook
      ? link(nextBook.abbrev, nextBook.name, 1)
      : null;

  return (
    <ChapterReader
      key={`${version}-${data.book.abbrev}-${data.chapter}`}
      version={version}
      book={{ abbrev: data.book.abbrev, name: data.book.name }}
      chapter={data.chapter}
      chapters={chapters}
      verses={data.verses}
      prev={prev}
      next={next}
    />
  );
}
