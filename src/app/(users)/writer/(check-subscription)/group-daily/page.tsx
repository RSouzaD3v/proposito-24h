import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

/* =========================
   Server Actions
========================= */
async function createGroupingDaily(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const writerId = (session.user as any)?.writerId;
  if (!writerId) redirect("/");

  const quotes = formData.getAll("quotes") as string[];
  const devotionals = formData.getAll("devotionals") as string[];
  const prayers = formData.getAll("prayers") as string[];
  const verses = formData.getAll("verses") as string[];

  await db.groupingDaily.create({
    data: {
      writerId,
      active: true,
      quotes: {
        connect: quotes.map((id) => ({ id })),
      },
      devotionals: {
        connect: devotionals.map((id) => ({ id })),
      },
      prayers: {
        connect: prayers.map((id) => ({ id })),
      },
      verses: {
        connect: verses.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/writer/group-daily");
}

/* =========================
   Page
========================= */
export default async function GroupDailyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const writerId = (session.user as any)?.writerId;
  if (!writerId) redirect("/");

  /* 🔹 Buscar tudo do writer */
  const [quotes, devotionals, prayers, verses, groupings] =
    await Promise.all([
      db.quote.findMany({
        where: { writerId },
        orderBy: { referenceDay: "asc" },
      }),
      db.devotional.findMany({
        where: { writerId },
        orderBy: { referenceDay: "asc" },
      }),
      db.prayer.findMany({
        where: { writerId },
        orderBy: { referenceDay: "asc" },
      }),
      db.verse.findMany({
        where: { writerId },
        orderBy: { referenceDay: "asc" },
      }),
      db.groupingDaily.findMany({
        where: { writerId },
        include: {
          quotes: true,
          devotionals: true,
          prayers: true,
          verses: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold">Agrupamento diário</h1>
        <p className="text-muted-foreground">
          Selecione conteúdos para exibição cronológica ao leitor.
        </p>
      </header>

      {/* Create Group */}
      <Card className="p-6 space-y-6">
        <h2 className="font-semibold text-lg">Novo agrupamento</h2>

        <form action={createGroupingDaily} className="space-y-6">
          <GroupSection title="Devocionais" name="devotionals" items={devotionals} />
          <GroupSection title="Versículos" name="verses" items={verses} />
          <GroupSection title="Orações" name="prayers" items={prayers} />
          <GroupSection title="Citações" name="quotes" items={quotes} />

          <div className="flex justify-end">
            <Button type="submit">Criar agrupamento</Button>
          </div>
        </form>
      </Card>

      {/* Existing Groups */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Agrupamentos criados</h2>

        {groupings.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhum agrupamento criado ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {groupings.map((g) => (
              <div
                key={g.id}
                className="rounded-md border p-4 text-sm space-y-1"
              >
                <p>
                  <strong>Status:</strong>{" "}
                  {g.active ? "Ativo" : "Inativo"}
                </p>
                <p>
                  <strong>Itens:</strong>{" "}
                  {g.devotionals.length} devocionais,{" "}
                  {g.verses.length} versículos,{" "}
                  {g.prayers.length} orações,{" "}
                  {g.quotes.length} citações
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* =========================
   Helper Component
========================= */
function GroupSection({
  title,
  name,
  items,
}: {
  title: string;
  name: string;
  items: any[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-medium">{title}</h3>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-2 border rounded-md p-2 text-sm"
          >
            <Checkbox name={name} value={item.id} />
            <span>
              Dia {item.referenceDay ?? "-"} —{" "}
              {item.title || item.content?.slice(0, 30)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
