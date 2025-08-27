import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiLock } from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);

  const userLogged = await db.user.findUnique({
    where: { id: session?.user.id },
  });

  if (!userLogged || !userLogged.writerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Acesso Negado</h2>
        <p className="text-gray-600 mb-6">Você precisa estar logado para acessar esta página.</p>
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Fazer Login
        </Link>
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
      visibility: true, // FREE | PAID
      category: true,
      slug: true,       // caso tenha rota por slug; se não, troque o Link abaixo
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
    <div className="relative flex flex-col gap-8 px-4 md:px-32 pb-16">
      {/* background gradiente sutil */}
      <div className="pointer-events-none absolute inset-0" />

      <Link
        href="/reader/area"
        className="z-10 sticky top-4 inline-flex items-center gap-2 self-start text-sm text-neutral-200 hover:text-white transition"
      >
        <FiChevronLeft className="text-xl" />
        Voltar
      </Link>

      <header className="z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">Ebooks</h1>
        <p className="text-neutral-300 mt-2">Explore os melhores livros</p>
      </header>

      {myBooks.length > 0 && (
        <section className="z-10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Meus Livros</h2>

          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {myBooks.map((book) => (
                <CarouselItem
                  key={book.id}
                  className="pl-2 md:pl-4 basis-40 sm:basis-44 md:basis-48 lg:basis-52"
                >
                  <Link href={`/reader/area/courses/${book.id}`} className="group block">
                    <Card className="bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 transition">
                      <CardContent className="p-3 h-[320px]">
                        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              sizes="(max-width: 768px) 40vw, (max-width: 1200px) 25vw, 20vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center bg-neutral-800">
                              <span className="text-neutral-400 text-sm">Sem capa</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />
                          {book.visibility === "PAID" && (
                            <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-neutral-200">
                              <FiLock />
                              Pago
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <h3
                            title={book.title}
                            className="line-clamp-2 text-sm md:text-base font-medium text-neutral-100 group-hover:text-white transition"
                          >
                            {book.title}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="border-neutral-700 hidden md:flex bg-black/40 text-white hover:bg-black/70 hover:border-neutral-600" />
            <CarouselNext className="border-neutral-700 hidden md:flex bg-black/40 text-white hover:bg-black/70 hover:border-neutral-600" />
          </Carousel>
        </section>
      )}

      {categories.length === 0 && (
        <div className="z-10 text-neutral-300">Nenhum livro publicado ainda.</div>
      )}

      {categories.map(([category, books]) => (
        <section key={category} className="z-10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{category}</h2>

          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {books.map((book) => (
                <CarouselItem
                  key={book.id}
                  className="pl-2 md:pl-4 basis-40 sm:basis-44 md:basis-48 lg:basis-52"
                >
                  <Link href={`/reader/area/courses/${book.id}`} className="group block">
                    <Card className="bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 transition">
                      <CardContent className="p-3 h-[320px]">
                        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              sizes="(max-width: 768px) 40vw, (max-width: 1200px) 25vw, 20vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center bg-neutral-800">
                              <span className="text-neutral-400 text-sm">Sem capa</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />
                          {book.visibility === "PAID" && (
                            <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-neutral-200">
                              <FiLock />
                              Pago
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <h3
                            title={book.title}
                            className="line-clamp-2 text-sm md:text-base font-medium text-neutral-100 group-hover:text-white transition"
                          >
                            {book.title}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="border-neutral-700 hidden md:flex bg-black/40 text-white hover:bg-black/70 hover:border-neutral-600" />
            <CarouselNext className="border-neutral-700 hidden md:flex bg-black/40 text-white hover:bg-black/70 hover:border-neutral-600" />
          </Carousel>
        </section>
      ))}
    </div>
  );
}
