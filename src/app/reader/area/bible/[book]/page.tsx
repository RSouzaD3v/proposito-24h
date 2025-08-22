import Link from "next/link";
import { getBookByAbbrev, getChaptersOfBook } from "@/lib/bible";

interface Props { params: { book: string } }

export async function generateMetadata({ params }: Props) {
    const book = await getBookByAbbrev(params.book);
    return { title: book ? `${book.name} — Capítulos` : "Livro não encontrado" };
}

export default async function BookChaptersPage({ params }: Props) {
    const book = await getBookByAbbrev(params.book);
    if (!book) return <div className="text-red-600">Livro não encontrado.</div>;

    const chapters = await getChaptersOfBook(params.book);

    return (
        <section>
            <div className="mb-6">
                <h2 className="text-2xl font-semibold">{book.name}</h2>
                <p className="text-sm text-muted-foreground">Escolha um capítulo</p>
            </div>


            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {chapters.map((c) => (
                    <Link
                        key={c}
                        href={`/reader/area/bible/${book.abbrev}/${c}`}
                        className="rounded-md border px-3 py-2 text-center hover:bg-accent"
                    >
                        {c}
                    </Link>
                ))}
            </div>


            <div className="mt-6">
                <Link href="/reader/area/bible" className="text-sm text-primary underline">← todos os livros</Link>
            </div>
        </section>
    );
}