import type { ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import type { LastRead, LibraryBook } from "@/lib/api/types";
import { GlassCard } from "@/components/ui/glass-card";
import { BookCover } from "./BookCover";
import { ContinueReading } from "./ContinueReading";

type Props<T extends LibraryBook> = {
  books: T[];
  myBooks: T[];
  lastRead?: LastRead | null;
  bookHref?: (book: T) => string;
  /** Selo extra sobre a capa, usado na prévia do escritor. */
  badge?: (book: T) => ReactNode;
  showContinueReading?: boolean;
};

const readerHref = (book: LibraryBook) => `/reader/area/courses/${book.id}`;

/** A biblioteca como o leitor vê; a prévia do escritor renderiza este mesmo componente. */
export function LibraryView<T extends LibraryBook>({
  books,
  myBooks,
  lastRead = null,
  bookHref = readerHref,
  badge,
  showContinueReading = true,
}: Props<T>) {
  const owned = new Set(myBooks.map((book) => book.id));

  const categories = new Map<string, T[]>();
  for (const book of books) {
    const category = book.category || "Outros";
    categories.set(category, [...(categories.get(category) ?? []), book]);
  }

  const shelf = (title: string, items: T[]) => (
    <Shelf key={title} title={title} books={items} owned={owned} bookHref={bookHref} badge={badge} />
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-10 pt-20 md:pt-10">
      <header className="mb-8 animate-glass-in">
        <p className="reader-eyebrow">Para a sua alma</p>
        <h1 className="mt-1 text-4xl md:text-5xl">Biblioteca</h1>
      </header>

      {showContinueReading && <ContinueReading books={books} lastRead={lastRead} />}

      {books.length === 0 ? (
        <GlassCard strong className="py-12 text-center">
          <h2 className="text-xl">Sua estante está sendo preparada</h2>
          <p className="mt-2 text-sm text-[var(--liquid-muted)]">Novos livros aparecerão aqui assim que forem publicados.</p>
        </GlassCard>
      ) : (
        <div className="space-y-9">
          {myBooks.length > 0 && shelf("Meus livros", myBooks)}
          {[...categories].map(([category, items]) => shelf(category, items))}
        </div>
      )}
    </div>
  );
}

function Shelf<T extends LibraryBook>({
  title,
  books,
  owned,
  bookHref,
  badge,
}: {
  title: string;
  books: T[];
  owned: Set<string>;
  bookHref: (book: T) => string;
  badge?: (book: T) => ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 text-2xl">{title}</h2>
      <ul className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
        {books.map((book) => (
          <li key={book.id} className="w-32 shrink-0 snap-start sm:w-40">
            <Link href={bookHref(book)} className="group block">
              <span className="relative block transition-transform duration-300 motion-safe:group-hover:-translate-y-1">
                <BookCover title={book.title} coverUrl={book.coverUrl} />
                {book.visibility === "PAID" && !owned.has(book.id) && (
                  <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md">
                    <Lock className="size-3.5" aria-label="Ebook pago" />
                  </span>
                )}
                {badge?.(book)}
              </span>
              <span className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-[var(--liquid-ink)]">
                {book.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
