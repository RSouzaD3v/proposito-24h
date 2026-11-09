import { notFound } from "next/navigation";
import { apiGetOrNull } from "@/lib/api/server";
import { BookPreviewStudio } from "./_components/BookPreviewStudio";

export default async function WriterBookPreviewStudioPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const book = await apiGetOrNull<{ id: string; title: string; status: string; visibility: string }>(
    `/writer/publications/${encodeURIComponent(bookId)}/preview`,
  );
  if (!book) notFound();

  return <BookPreviewStudio book={book} />;
}
