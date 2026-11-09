import BookFormatContent from "./_components/BookFormatContent";
import { LockedBook, type LockedBookData } from "./_components/LockedBook";
import { BackButton } from "@/components/ui/back-button";
import { apiGetOrNull } from "@/lib/api/server";

interface BookDetails extends LockedBookData {
  locked: boolean;
  progress?: { currentChapter: number; lastReadAt: string } | null;
  pdfUrl?: string | null;
  chapters: { title: string; subtitle?: string | null; content?: string; coverUrl?: string | null }[];
}

export default async function BookDetailsPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const book = await apiGetOrNull<BookDetails>(`/reader/publications/${encodeURIComponent(bookId)}`);

  if (!book) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <p className="reader-serif text-2xl">Livro não encontrado</p>
        <BackButton href="/reader/area/courses" label="Voltar à biblioteca" className="mt-4" />
      </div>
    );
  }

  if (book.locked) return <LockedBook bookId={bookId} book={book} />;

  return (
    <BookFormatContent
      bookId={bookId}
      trackProgress
      serverProgress={book.progress}
      title={book.title}
      subtitle={book.subtitle}
      description={book.description}
      coverUrl={book.coverUrl}
      pdfUrl={book.pdfUrl ?? null}
      chapters={book.chapters.map((chapter) => ({
        title: chapter.title,
        subtitle: chapter.subtitle ?? "",
        content: chapter.content ?? "",
        coverUrl: chapter.coverUrl ?? undefined,
      }))}
    />
  );
}
