import BookFormatContent from "./_components/BookFormatContent";
import { BackButton } from "@/components/ui/back-button";
import { FaCrown } from "react-icons/fa";
import { BuyButton } from "./_components/BuyButton";
import SubscribeWidget from "@/components/subscriptions/SubscribeWidget";
import { apiGetOrNull } from "@/lib/api/server";

interface BookDetails {
  locked: boolean;
  accessMode: "FREE" | "PAID" | "SUBSCRIPTION";
  price: number | null;
  writerId: string;
  pdfUrl?: string | null;
  chapters: { title: string; subtitle?: string | null; content?: string; coverUrl?: string | null }[];
}

export default async function BookDetailsPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const book = await apiGetOrNull<BookDetails>(`/reader/publications/${encodeURIComponent(bookId)}`);

  if (!book) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="text-lg">Livro não encontrado.</p>
        <BackButton href="/reader/area/courses" label="Voltar aos ebooks" className="mt-4" />
      </div>
    );
  }

  if (book.locked) {
    const subscriptionOnly = book.accessMode === "SUBSCRIPTION";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <BackButton href="/reader/area/courses" label="Voltar aos ebooks" className="absolute left-5 top-5" />
        <h2 className="mb-4 flex flex-col items-center text-2xl font-bold text-white md:text-3xl">
          <FaCrown className="mb-2 inline" />
          {subscriptionOnly ? "Conteúdo para assinantes" : "Este ebook é pago"}
        </h2>
        <p className="mb-6 max-w-md text-gray-500">
          {subscriptionOnly
            ? "Assinatura necessária para ler este conteúdo."
            : "Compre este ebook ou assine o escritor para acessar."}
        </p>
        <div className="flex w-full max-w-md flex-col items-center justify-center gap-4">
          {book.accessMode === "PAID" && book.price && book.price >= 1 ? (
            <BuyButton publicationId={bookId} />
          ) : null}
          <div className="w-full rounded-xl border bg-white/95 p-4 text-left text-gray-900 shadow-lg">
            <SubscribeWidget writerId={book.writerId} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <BackButton
        href="/reader/area/courses"
        className="absolute left-2 top-2 z-50 md:left-3 md:top-3"
      />

      <BookFormatContent
        bookId={bookId}
        pdfUrl={book.pdfUrl ?? null}
        chapters={book.chapters.map((chapter) => ({
          title: chapter.title,
          subtitle: chapter.subtitle ?? "",
          content: chapter.content ?? "",
          coverUrl: chapter.coverUrl ?? undefined,
        }))}
      />
    </div>
  );
}
