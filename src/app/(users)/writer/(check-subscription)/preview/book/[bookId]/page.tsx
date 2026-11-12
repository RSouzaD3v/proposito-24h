import { notFound } from "next/navigation";
import { apiGetOrNull } from "@/lib/api/server";
import BookFormatContent from "@/app/(users)/reader/area/courses/[bookId]/_components/BookFormatContent";
import { LockedBook } from "@/app/(users)/reader/area/courses/[bookId]/_components/LockedBook";
import { LiveChapter } from "./LiveChapter";

const LIBRARY = "/writer/preview/library";

type PreviewBook = {
  id: string;
  writerId: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverUrl: string | null;
  price: number | null;
  visibility: string;
  pdfUrl: string | null;
  isPdf?: boolean;
  freePreviewChapters?: number;
  chapters: { title: string; subtitle: string | null; content: string; coverUrl: string | null }[];
};

export default async function WriterBookPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string }>;
  searchParams: Promise<{ as?: string; chapter?: string }>;
}) {
  const { bookId } = await params;
  const { as, chapter } = await searchParams;
  const book = await apiGetOrNull<PreviewBook>(`/writer/publications/${encodeURIComponent(bookId)}/preview`);
  if (!book) notFound();

  const chapters = book.chapters.map((item) => ({
    title: item.title,
    subtitle: item.subtitle ?? "",
    content: item.content,
    coverUrl: item.coverUrl ?? undefined,
  }));

  if (chapter !== undefined) {
    return (
      <LiveChapter
        bookId={book.id}
        bookTitle={book.title}
        chapters={chapters}
        initialIndex={Math.max(Number(chapter) || 0, 0)}
        libraryHref={LIBRARY}
      />
    );
  }

  const accessMode = book.visibility !== "PAID" ? "FREE" : book.price && book.price >= 1 ? "PAID" : "SUBSCRIPTION";
  if (as === "locked" && accessMode !== "FREE") {
    // Mesma regra da API: PDF não tem degustação; os primeiros capítulos grátis aparecem completos.
    const free = book.isPdf ? 0 : (book.freePreviewChapters ?? 0);
    const lockedChapters = book.chapters.map((item, index) => ({ ...item, preview: index < free }));
    return <LockedBook bookId={book.id} book={{ ...book, accessMode, chapters: lockedChapters }} backHref={LIBRARY} preview />;
  }

  return (
    <BookFormatContent
      // Prefixo separado para o progresso da prévia não se misturar com o de uma leitura real.
      bookId={`preview-${book.id}`}
      title={book.title}
      subtitle={book.subtitle}
      description={book.description}
      coverUrl={book.coverUrl}
      pdfUrl={book.pdfUrl}
      chapters={chapters}
      libraryHref={LIBRARY}
    />
  );
}
