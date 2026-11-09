import { apiGet } from "@/lib/api/server";
import type { LibraryBook } from "@/lib/api/types";
import { LibraryView } from "@/app/(users)/reader/area/courses/_components/LibraryView";

type Publication = LibraryBook & { type: string; status: string };

export default async function WriterLibraryPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ drafts?: string }>;
}) {
  const { drafts } = await searchParams;
  const publications = await apiGet<Publication[]>("/writer/publications");

  const books = publications
    .filter((book) => book.type === "EBOOK" && (book.status === "PUBLISHED" || (drafts === "1" && book.status === "DRAFT")))
    .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

  return (
    <LibraryView
      books={books}
      myBooks={[]}
      showContinueReading={false}
      bookHref={(book) => `/writer/preview/book/${book.id}`}
      badge={(book) =>
        book.status === "DRAFT" ? (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[11px] font-bold text-white">Rascunho</span>
        ) : null
      }
    />
  );
}
