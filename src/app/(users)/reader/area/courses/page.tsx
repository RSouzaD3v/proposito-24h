import Link from "next/link";
import { Lock } from "lucide-react";
import { apiGet, apiGetOrNull } from "@/lib/api/server";
import type { LibraryBook, ReaderProfile } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { BookCover } from "./_components/BookCover";
import { ContinueReading } from "./_components/ContinueReading";

export default async function CoursesPage() {
  const userLogged = await apiGetOrNull<ReaderProfile>("/reader/profile");

  if (!userLogged || !userLogged.writerId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <GlassCard strong className="max-w-md space-y-4 text-center">
          <h2 className="text-2xl">Acesso negado</h2>
          <p className="text-[var(--liquid-muted)]">Você precisa estar logado para acessar esta página.</p>
          <Button asChild variant="glass-primary" className="rounded-full">
            <Link href="/login">Fazer login</Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  const { books, myBooks } = await apiGet<{ books: LibraryBook[]; myBooks: LibraryBook[] }>("/reader/library");
  const owned = new Set(myBooks.map((book) => book.id));

  const categories = new Map<string, LibraryBook[]>();
  for (const book of books) {
    const category = book.category || "Outros";
    categories.set(category, [...(categories.get(category) ?? []), book]);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-10 pt-20 md:pt-10">
      <header className="mb-8 animate-glass-in">
        <p className="reader-eyebrow">Para a sua alma</p>
        <h1 className="mt-1 text-4xl md:text-5xl">Biblioteca</h1>
      </header>

      <ContinueReading books={books} />

      {books.length === 0 ? (
        <GlassCard strong className="py-12 text-center">
          <h2 className="text-xl">Sua estante está sendo preparada</h2>
          <p className="mt-2 text-sm text-[var(--liquid-muted)]">Novos livros aparecerão aqui assim que forem publicados.</p>
        </GlassCard>
      ) : (
        <div className="space-y-9">
          {myBooks.length > 0 && <Shelf title="Meus livros" books={myBooks} owned={owned} />}
          {[...categories].map(([category, shelf]) => (
            <Shelf key={category} title={category} books={shelf} owned={owned} />
          ))}
        </div>
      )}
    </div>
  );
}

function Shelf({ title, books, owned }: { title: string; books: LibraryBook[]; owned: Set<string> }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl">{title}</h2>
      <ul className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
        {books.map((book) => (
          <li key={book.id} className="w-32 shrink-0 snap-start sm:w-40">
            <Link href={`/reader/area/courses/${book.id}`} className="group block">
              <span className="relative block transition-transform duration-300 motion-safe:group-hover:-translate-y-1">
                <BookCover title={book.title} coverUrl={book.coverUrl} />
                {book.visibility === "PAID" && !owned.has(book.id) && (
                  <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md">
                    <Lock className="size-3.5" aria-label="Ebook pago" />
                  </span>
                )}
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
