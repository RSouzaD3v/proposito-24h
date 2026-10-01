import Link from "next/link";
import { FiLock } from "react-icons/fi";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { BackButton } from "@/components/ui/back-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);

  const userLogged = await db.user.findUnique({
    where: { id: session?.user.id },
  });

  if (!userLogged || !userLogged.writerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <GlassCard strong className="max-w-md space-y-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--liquid-ink)]">
            Acesso Negado
          </h2>
          <p className="text-[var(--liquid-muted)]">
            Você precisa estar logado para acessar esta página.
          </p>
          <Button asChild variant="glass-primary" className="rounded-full">
            <Link href="/login">Fazer Login</Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  const books = await db.publication.findMany({
    where: {
      type: "EBOOK",
      status: "PUBLISHED",
      writerId: userLogged.writerId,
    },
    select: {
      id: true,
      title: true,
      coverUrl: true,
      visibility: true,
      category: true,
      slug: true,
    },
    orderBy: { title: "asc" },
  });

  const booksByCategory = books.reduce((acc, book) => {
    const category = book.category || "Outros";
    if (!acc[category]) acc[category] = [];
    acc[category].push(book);
    return acc;
  }, {} as Record<string, typeof books>);

  const categories = Object.entries(booksByCategory);

  const myBooks = await db.publication.findMany({
    where: {
      writerId: userLogged.writerId,
      type: "EBOOK",
      status: "PUBLISHED",
      purchases: {
        some: {
          userId: userLogged.id,
        },
      }
    }
  });

  return (
    <div className="relative flex flex-col gap-8 px-4 md:px-8 lg:px-16 pb-16 pt-8">
      <BackButton href="/reader/area" className="self-start" />

      <header>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--liquid-ink)]">
          Ebooks
        </h1>
        <p className="text-[var(--liquid-muted)] mt-2">Explore os melhores livros</p>
      </header>

      {myBooks.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--liquid-ink)] mb-3">
            Meus Livros
          </h2>

          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {myBooks.map((book) => (
                <CarouselItem
                  key={book.id}
                  className="pl-2 md:pl-4 basis-40 sm:basis-44 md:basis-48 lg:basis-52"
                >
                  <Link href={`/reader/area/courses/${book.id}`} className="group block">
                    <GlassCard padding="sm" interactive className="h-[320px]">
                      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            sizes="(max-width: 768px) 40vw, (max-width: 1200px) 25vw, 20vw"
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center bg-white/20">
                            <span className="text-[var(--liquid-muted)] text-sm">Sem capa</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                        {book.visibility === "PAID" && (
                          <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md glass-surface px-2 py-1 text-xs text-[var(--liquid-ink)]">
                            <FiLock />
                            Pago
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <h3
                          title={book.title}
                          className="line-clamp-2 text-sm md:text-base font-medium text-[var(--liquid-ink)]"
                        >
                          {book.title}
                        </h3>
                      </div>
                    </GlassCard>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </section>
      )}

      {categories.length === 0 && (
        <div className="text-[var(--liquid-muted)]">Nenhum livro publicado ainda.</div>
      )}

      {categories.map(([category, booksInCategory]) => (
        <section key={category}>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--liquid-ink)] mb-3">
            {category}
          </h2>

          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {booksInCategory.map((book) => (
                <CarouselItem
                  key={book.id}
                  className="pl-2 md:pl-4 basis-40 sm:basis-44 md:basis-48 lg:basis-52"
                >
                  <Link href={`/reader/area/courses/${book.id}`} className="group block">
                    <GlassCard padding="sm" interactive className="h-[320px]">
                      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            sizes="(max-width: 768px) 40vw, (max-width: 1200px) 25vw, 20vw"
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center bg-white/20">
                            <span className="text-[var(--liquid-muted)] text-sm">Sem capa</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                        {book.visibility === "PAID" && (
                          <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md glass-surface px-2 py-1 text-xs text-[var(--liquid-ink)]">
                            <FiLock />
                            Pago
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <h3
                          title={book.title}
                          className="line-clamp-2 text-sm md:text-base font-medium text-[var(--liquid-ink)]"
                        >
                          {book.title}
                        </h3>
                      </div>
                    </GlassCard>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </section>
      ))}
    </div>
  );
}
