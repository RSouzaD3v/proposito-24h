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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* -------------------------
   Server Actions
------------------------- */
async function updateGame(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const id = String(formData.get("id"));
  const title = String(formData.get("title")).trim();
  const description = String(formData.get("description") || "").trim();
  const active = formData.get("active") === "on";

  if (!id || !title) return;

  await db.gameTemplate.update({
    where: { id },
    data: {
      title,
      description: description || null,
      active,
    },
  });

  revalidatePath(`/admin/game/${id}`);
}

async function createLevel(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const gameTemplateId = String(formData.get("gameTemplateId"));

  const lastLevel = await db.gameLevel.findFirst({
    where: { gameTemplateId },
    orderBy: { order: "desc" },
  });

  const nextOrder = lastLevel ? lastLevel.order + 1 : 1;

  const level = await db.gameLevel.create({
    data: {
      gameTemplateId,
      order: nextOrder,
      letters: [],
      layout: [],
    },
  });

  redirect(`/admin/game/${gameTemplateId}/level/${level.id}`);
}

/* -------------------------
   Page
------------------------- */
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminGameEditPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const role = (session.user as any)?.role;
  if (role !== "ADMIN") redirect("/");

  const game = await db.gameTemplate.findUnique({
    where: { id: (await params).id },
    include: {
      levels: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { words: true } },
        },
      },
    },
  });

  if (!game) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{game.title}</h1>
          <p className="text-sm text-muted-foreground">
            Editar jogo e gerenciar níveis
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/admin/game">Voltar</Link>
        </Button>
      </header>

      {/* Game form */}
      <Card className="p-6">
        <form action={updateGame} className="space-y-6">
          <input type="hidden" name="id" value={game.id} />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input name="title" defaultValue={game.title} />
            </div>

            <div className="space-y-2">
              <Label>Ativo</Label>
              <div className="flex items-center gap-2">
                <Switch name="active" defaultChecked={game.active} />
                <span className="text-sm text-muted-foreground">
                  Disponível para os jogadores
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              name="description"
              defaultValue={game.description ?? ""}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Card>

      {/* Levels */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Níveis</h2>

          <form action={createLevel}>
            <input
              type="hidden"
              name="gameTemplateId"
              value={game.id}
            />
            <Button size="sm">Adicionar nível</Button>
          </form>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nível</TableHead>
              <TableHead className="text-center">Letras</TableHead>
              <TableHead className="text-center">Palavras</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {game.levels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  Nenhum nível criado ainda
                </TableCell>
              </TableRow>
            ) : (
              game.levels.map((lvl) => (
                <TableRow key={lvl.id}>
                  <TableCell>
                    Nível {lvl.order}
                  </TableCell>

                  <TableCell className="text-center">
                    {lvl.letters.length}
                  </TableCell>

                  <TableCell className="text-center">
                    {lvl._count.words}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/admin/game/${game.id}/level/${lvl.id}`}
                      >
                        Editar
                      </Link>
                    </Button>
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
