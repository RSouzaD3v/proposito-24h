import { Lock } from "lucide-react";
import BookFormatContent from "./_components/BookFormatContent";
import { BookHero } from "./_components/BookHero";
import { BuyButton } from "./_components/BuyButton";
import { BackButton } from "@/components/ui/back-button";
import SubscribeWidget from "@/components/subscriptions/SubscribeWidget";
import { apiGetOrNull } from "@/lib/api/server";

interface BookDetails {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverUrl?: string | null;
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <p className="reader-serif text-2xl">Livro não encontrado</p>
        <BackButton href="/reader/area/courses" label="Voltar à biblioteca" className="mt-4" />
      </div>
    );
  }

  if (book.locked) {
    const subscriptionOnly = book.accessMode === "SUBSCRIPTION";
    return (
      <>
        <BookHero title={book.title} subtitle={book.subtitle} coverUrl={book.coverUrl} />
        <div className="mx-auto w-full max-w-2xl space-y-6 px-5 pt-6 animate-glass-in">
          <div className="text-center">
            <p className="reader-eyebrow">{subscriptionOnly ? "Para assinantes" : "Ebook pago"}</p>
            <p className="mx-auto mt-2 max-w-md text-[var(--liquid-muted)]">
              {subscriptionOnly
                ? "Assine para ler este livro e todo o conteúdo exclusivo."
                : "Compre este ebook ou assine o escritor para ter acesso."}
            </p>
          </div>

          {book.accessMode === "PAID" && book.price && book.price >= 1 ? (
            <div className="flex justify-center">
              <BuyButton
                publicationId={bookId}
                className="h-12 w-full rounded-full bg-[var(--liquid-accent)] text-sm font-bold text-[var(--liquid-on-accent)] disabled:opacity-60"
              />
            </div>
          ) : null}

          <div className="glass-surface-strong p-4 text-left">
            <SubscribeWidget writerId={book.writerId} />
          </div>

          {book.description && (
            <section>
              <h2 className="mb-2 text-xl">Sobre este livro</h2>
              <p className="whitespace-pre-line leading-relaxed text-[var(--liquid-muted)]">{book.description}</p>
            </section>
          )}

          {book.chapters.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl">O que você vai ler</h2>
              <ol className="glass-surface-strong divide-y divide-[var(--border)] overflow-hidden">
                {book.chapters.map((chapter, index) => (
                  <li key={index} className="flex min-h-14 items-center gap-4 px-4 py-3">
                    <span className="reader-serif w-6 shrink-0 text-center tabular-nums text-[var(--reader-gold)]">{index + 1}</span>
                    <span className="min-w-0 flex-1 text-sm font-semibold">{chapter.title}</span>
                    <Lock className="size-4 shrink-0 text-[var(--liquid-muted)]" aria-hidden />
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </>
    );
  }

  return (
    <BookFormatContent
      bookId={bookId}
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
