import Link from "next/link";
import { getBooks } from "@/lib/bible";

export const metadata = { title: "Bíblia — Livros" };

export default async function BibleHomePage() {
    const books = await getBooks();
    
    return (
        <section className="min-h-screen">
            <h2 className="sr-only">Livros</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {books.map((b) => (
                    <Link
                    key={b.id}
                    href={`/reader/area/bible/${b.abbrev}`}
                    className="rounded-xl border p-4 hover:shadow-sm transition"
                    >
                        <div className="text-sm text-muted-foreground">{b.order}</div>
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-xs text-muted-foreground">/{b.abbrev}</div>
                    </Link>
                ))}
            </div>
        </section>
    );
}