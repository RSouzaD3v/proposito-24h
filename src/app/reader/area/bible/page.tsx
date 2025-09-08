import Link from "next/link";
import { getBooks } from "@/lib/bible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const metadata = { title: "Bíblia — Livros" };

export default async function BibleHomePage() {
  const books = await getBooks();

  // Split por campo 'testament' (se existir) ou por 'order' (fallback)
  const otBooks = books.filter((b: any) =>
    typeof b.testament === "string"
      ? b.testament.toLowerCase().startsWith("old") || b.testament.toLowerCase().includes("velho")
      : Number(b.order) <= 39
  );

  const ntBooks = books.filter((b: any) =>
    typeof b.testament === "string"
      ? b.testament.toLowerCase().startsWith("new") || b.testament.toLowerCase().includes("novo")
      : Number(b.order) > 39
  );

  const BooksGrid = ({ items }: { items: any[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {items.map((b) => (
        <Link
          key={b.id ?? b.abbrev ?? b.name}
          href={`/reader/area/bible/${b.abbrev}`}
          className="rounded-xl border p-4 hover:shadow-sm transition bg-gray-100 hover:bg-gray-200"
        >
          <div className="text-sm text-black">{b.order}</div>
          <div className="font-semibold text-black">{b.name}</div>
          <div className="text-xs text-black">/{b.abbrev}</div>
        </Link>
      ))}
    </div>
  );

  return (
    <section className="min-h-screen">
      <h2 className="sr-only">Livros</h2>

      <Tabs defaultValue="ot" className="mt-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ot">Velho Testamento ({otBooks.length})</TabsTrigger>
          <TabsTrigger value="nt">Novo Testamento ({ntBooks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ot" className="mt-4">
          <BooksGrid items={otBooks} />
        </TabsContent>

        <TabsContent value="nt" className="mt-4">
          <BooksGrid items={ntBooks} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
