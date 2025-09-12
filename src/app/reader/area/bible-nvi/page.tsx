import Link from "next/link";
import { getBooks } from "@/lib/bible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TeacherBibleAI from "@/components/TeacherBibleAi";

export const metadata = { title: "Bíblia — Livros" };

type Subdivision =
  | "Pentateuco"
  | "Históricos"
  | "Poéticos e Sabedoria"
  | "Profetas Maiores"
  | "Profetas Menores"
  | "Evangelhos e Atos"
  | "Cartas Paulinas"
  | "Cartas Gerais"
  | "Apocalipse";

function getSubdivisionByOrder(order: number): Subdivision {
  if (order >= 1 && order <= 5) return "Pentateuco";
  if (order >= 6 && order <= 17) return "Históricos";
  if (order >= 18 && order <= 22) return "Poéticos e Sabedoria";
  if (order >= 23 && order <= 27) return "Profetas Maiores";
  if (order >= 28 && order <= 39) return "Profetas Menores";
  if (order >= 40 && order <= 44) return "Evangelhos e Atos";
  if (order >= 45 && order <= 57) return "Cartas Paulinas";
  if (order >= 58 && order <= 65) return "Cartas Gerais";
  return "Apocalipse"; // 66
}

// Cores por subdivisão (pode ajustar à vontade)
const BADGE_STYLES: Record<Subdivision, string> = {
  "Pentateuco": "bg-emerald-600 text-white border-transparent hover:brightness-110",
  "Históricos": "bg-amber-600 text-white border-transparent hover:brightness-110",
  "Poéticos e Sabedoria": "bg-fuchsia-600 text-white border-transparent hover:brightness-110",
  "Profetas Maiores": "bg-sky-600 text-white border-transparent hover:brightness-110",
  "Profetas Menores": "bg-cyan-600 text-white border-transparent hover:brightness-110",
  "Evangelhos e Atos": "bg-rose-600 text-white border-transparent hover:brightness-110",
  "Cartas Paulinas": "bg-indigo-600 text-white border-transparent hover:brightness-110",
  "Cartas Gerais": "bg-violet-600 text-white border-transparent hover:brightness-110",
  "Apocalipse": "bg-red-700 text-white border-transparent hover:brightness-110",
};

export default async function BibleHomePage() {
  const books = await getBooks();

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
      {items.map((b) => {
        const order = Number(b.order);
        const subdiv = getSubdivisionByOrder(order);
        const badgeClass = BADGE_STYLES[subdiv];

        return (
          <Link
            key={b.id ?? b.abbrev ?? b.name}
            href={`/reader/area/bible-nvi/${b.abbrev}`}
            className="flex flex-col justify-between rounded-xl border p-4 hover:shadow-sm transition bg-gray-100 hover:bg-gray-200"
          >
            <div>
              <div className="text-sm text-black">{order}</div>
              <div className="font-semibold text-black pr-16 line-clamp-2">{b.name}</div>
              <div className="text-xs text-black">/{b.abbrev}</div>
            </div>
            <Badge
              variant="default"
              className={`my-2 ${badgeClass}`}
              aria-label={`Subdivisão: ${subdiv}`}
              title={subdiv}
            >
              {subdiv}
            </Badge>
          </Link>
        );
      })}
    </div>
  );

  return (
    <section className="min-h-screen">
      <TeacherBibleAI />
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
