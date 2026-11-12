import { Lock } from "lucide-react";
import SubscribeWidget from "@/components/subscriptions/SubscribeWidget";
import BookFormatContent from "./BookFormatContent";
import { BookHero } from "./BookHero";
import { BuyButton } from "./BuyButton";

export type LockedBookData = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  accessMode: "FREE" | "PAID" | "SUBSCRIPTION";
  price: number | null;
  writerId: string;
  /** Capítulos de degustação vêm com `preview: true` e o conteúdo completo; os demais, só com o título. */
  chapters: {
    title: string;
    subtitle?: string | null;
    content?: string | null;
    coverUrl?: string | null;
    preview?: boolean;
  }[];
};

/** Quantos capítulos do início podem ser lidos sem acesso (degustação). */
function previewCount(chapters: LockedBookData["chapters"]) {
  const firstLocked = chapters.findIndex((chapter) => !chapter.preview || typeof chapter.content !== "string");
  return firstLocked === -1 ? chapters.length : firstLocked;
}

function Paywall({ bookId, book, preview, hasSample }: { bookId: string; book: LockedBookData; preview: boolean; hasSample: boolean }) {
  const subscriptionOnly = book.accessMode === "SUBSCRIPTION";
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="reader-eyebrow">{subscriptionOnly ? "Para assinantes" : "Ebook pago"}</p>
        <p className="mx-auto mt-2 max-w-md text-[var(--liquid-muted)]">
          {hasSample ? "Gostou da amostra? " : ""}
          {subscriptionOnly
            ? "Assine para ler este livro e todo o conteúdo exclusivo."
            : "Compre este ebook ou assine o escritor para ter acesso."}
        </p>
      </div>

      <div inert={preview} className="space-y-6">
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
      </div>
    </div>
  );
}

/** Página de um livro sem acesso; na prévia do escritor, os botões de compra ficam inativos. */
export function LockedBook({
  bookId,
  book,
  backHref,
  preview = false,
}: {
  bookId: string;
  book: LockedBookData;
  backHref?: string;
  preview?: boolean;
}) {
  const sample = previewCount(book.chapters);

  // Com degustação, o leitor lê os primeiros capítulos e encontra o paywall no primeiro bloqueado.
  if (sample > 0) {
    return (
      <BookFormatContent
        // Prefixo separado para o progresso da prévia do escritor não se misturar com uma leitura real.
        bookId={preview ? `preview-${bookId}` : bookId}
        trackProgress={!preview}
        title={book.title}
        subtitle={book.subtitle}
        description={book.description}
        coverUrl={book.coverUrl}
        libraryHref={backHref}
        lockedFrom={sample}
        paywall={<Paywall bookId={bookId} book={book} preview={preview} hasSample />}
        chapters={book.chapters.map((chapter) => ({
          title: chapter.title,
          subtitle: chapter.subtitle ?? "",
          content: chapter.content ?? "",
          coverUrl: chapter.coverUrl ?? undefined,
        }))}
      />
    );
  }

  return (
    <>
      <BookHero title={book.title} subtitle={book.subtitle} coverUrl={book.coverUrl} backHref={backHref} />
      <div className="mx-auto w-full max-w-2xl space-y-6 px-5 pt-6 animate-glass-in">
        <Paywall bookId={bookId} book={book} preview={preview} hasSample={false} />

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
