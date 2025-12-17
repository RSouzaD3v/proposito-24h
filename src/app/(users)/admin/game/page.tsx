import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { authOptions } from "@/lib/authOption";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

async function toggleGameActive(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "");

  if (!id) return;

  const nextActive = active !== "true";

  await db.gameTemplate.update({
    where: { id },
    data: { active: nextActive },
  });

  revalidatePath("/admin/game");
}

export default async function AdminGamePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");

  // Ajuste se você usa roles diferentes
  const role = (session.user as any)?.role;
  if (role !== "ADMIN") redirect("/");

  const games = await db.gameTemplate.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: {
          levels: true,
          playerGames: true,
        },
      },
      levels: {
        select: {
          id: true,
          _count: { select: { words: true } },
        },
      },
    },
  });

  const totalGames = games.length;
  const activeGames = games.filter((g) => g.active).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Jogos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie templates, níveis e palavras do mini-game.
          </p>
          <div className="flex gap-2 pt-2">
            <Badge variant="outline">Total: {totalGames}</Badge>
            <Badge variant="secondary">Ativos: {activeGames}</Badge>
          </div>
        </div>

        <Button asChild>
          <Link href="/admin/game/new">Criar jogo</Link>
        </Button>
      </header>

      {/* List */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jogo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Níveis</TableHead>
              <TableHead className="text-center">Palavras</TableHead>
              <TableHead className="text-center">Jogadores</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {games.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  <div className="space-y-2">
                    <p className="font-medium">Nenhum jogo criado ainda</p>
                    <p className="text-sm text-muted-foreground">
                      Crie o primeiro template para começar a montar os níveis.
                    </p>
                    <Button asChild className="mt-2">
                      <Link href="/admin/game/new">Criar jogo</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              games.map((g) => {
                const totalWords = g.levels.reduce(
                  (acc, lvl) => acc + (lvl._count?.words || 0),
                  0
                );

                return (
                  <TableRow key={g.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold leading-tight">
                          {g.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          /{g.slug}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{g.type}</Badge>
                    </TableCell>

                    <TableCell>
                      {g.active ? (
                        <Badge variant="secondary">Ativo</Badge>
                      ) : (
                        <Badge variant="outline">Inativo</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {g._count.levels}
                    </TableCell>

                    <TableCell className="text-center">{totalWords}</TableCell>

                    <TableCell className="text-center">
                      {g._count.playerGames}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/game/${g.id}`}>Editar</Link>
                        </Button>

                        <form action={toggleGameActive}>
                          <input type="hidden" name="id" value={g.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={String(g.active)}
                          />
                          <Button size="sm" variant="secondary">
                            {g.active ? "Desativar" : "Ativar"}
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
