import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { authOptions } from "@/lib/authOption";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ======================================================
   Helpers
====================================================== */
function generateCircularLayout(count: number) {
  if (count === 0) return [];

  const centerX = 0.5;
  const centerY = 0.5;
  const radius = 0.28;

  return Array.from({ length: count }).map((_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: Number((centerX + radius * Math.cos(angle)).toFixed(2)),
      y: Number((centerY + radius * Math.sin(angle)).toFixed(2)),
    };
  });
}

/* ======================================================
   Server Actions
====================================================== */
async function updateLevel(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const levelId = String(formData.get("levelId"));
  const order = Number(formData.get("order"));
  const lettersRaw = String(formData.get("letters") || "");

  const letters = lettersRaw
    .split(",")
    .map((l) => l.trim().toUpperCase())
    .filter(Boolean);

  const level = await db.gameLevel.findUnique({
    where: { id: levelId },
  });

  if (!level) return;

  let layout = level.layout as any[];

  // 🔒 garante layout válido
  if (!Array.isArray(layout) || layout.length !== letters.length) {
    layout = generateCircularLayout(letters.length);
  }

  await db.gameLevel.update({
    where: { id: levelId },
    data: {
      order,
      letters,
      layout,
    },
  });

  revalidatePath("/admin/game");
}

async function applyDefaultLayout(formData: FormData) {
  "use server";

  const levelId = String(formData.get("levelId"));

  const level = await db.gameLevel.findUnique({
    where: { id: levelId },
  });

  if (!level) return;

  const layout = generateCircularLayout(level.letters.length);

  await db.gameLevel.update({
    where: { id: levelId },
    data: { layout },
  });

  revalidatePath("/admin/game");
}

async function addWord(formData: FormData) {
  "use server";

  const levelId = String(formData.get("levelId"));
  const word = String(formData.get("word") || "")
    .trim()
    .toUpperCase();
  const bonus = formData.get("bonus") === "on";

  if (!word) return;

  await db.gameWord.create({
    data: {
      levelId,
      word,
      bonus,
    },
  });

  revalidatePath("/admin/game");
}

async function deleteWord(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  await db.gameWord.delete({ where: { id } });

  revalidatePath("/admin/game");
}

/* ======================================================
   Page
====================================================== */
interface PageProps {
  params: Promise<{
    id: string;
    levelId: string;
  }>;
}

export default async function AdminGameLevelPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const role = (session.user as any)?.role;
  if (role !== "ADMIN") redirect("/");

  const { id, levelId } = await params;

  const level = await db.gameLevel.findUnique({
    where: { id: levelId },
    include: {
      words: true,
      gameTemplate: true,
    },
  });

  if (!level) notFound();

  const layout =
    Array.isArray(level.layout) && level.layout.length === level.letters.length
      ? level.layout
      : generateCircularLayout(level.letters.length);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            {level.gameTemplate.title} — Nível {level.order}
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure letras, layout e palavras
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/admin/game/${id}`}>Voltar</Link>
        </Button>
      </header>

      {/* Level */}
      <Card className="p-6 space-y-4">
        <form action={updateLevel} className="space-y-4">
          <input type="hidden" name="levelId" value={level.id} />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Ordem do nível</Label>
              <Input type="number" name="order" defaultValue={level.order} />
            </div>

            <div className="space-y-1">
              <Label>Letras (separadas por vírgula)</Label>
              <Input
                name="letters"
                defaultValue={level.letters.join(",")}
                placeholder="A,B,C,D"
              />
            </div>
          </div>

          <Button type="submit">Salvar nível</Button>
        </form>
      </Card>

      {/* Layout Preview */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Layout</h2>

          <form action={applyDefaultLayout}>
            <input type="hidden" name="levelId" value={level.id} />
            <Button size="sm" variant="secondary">
              Aplicar layout padrão
            </Button>
          </form>
        </div>

        <div className="relative w-full aspect-square rounded-xl bg-muted border">
          {layout.map((p: any, i: number) => (
            <div
              key={i}
              className="absolute w-12 h-12 rounded-full bg-background border shadow flex items-center justify-center font-bold"
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {level.letters[i]}
            </div>
          ))}
        </div>
      </Card>

      {/* Words */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">Palavras</h2>

          <form action={addWord} className="flex items-center gap-2">
            <input type="hidden" name="levelId" value={level.id} />

            <Input name="word" placeholder="PALAVRA" className="w-40" />

            <div className="flex items-center gap-1">
              <Checkbox name="bonus" />
              <span className="text-sm">Bônus</span>
            </div>

            <Button size="sm">Adicionar</Button>
          </form>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Palavra</TableHead>
              <TableHead className="text-center">Bônus</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {level.words.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center">
                  Nenhuma palavra cadastrada
                </TableCell>
              </TableRow>
            ) : (
              level.words.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-mono">{w.word}</TableCell>
                  <TableCell className="text-center">
                    {w.bonus ? "✔️" : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={deleteWord}>
                      <input type="hidden" name="id" value={w.id} />
                      <Button size="sm" variant="outline">
                        Remover
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
