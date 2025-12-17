import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { authOptions } from "@/lib/authOption";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* -------------------------
   Server Action
------------------------- */
async function createGame(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const type = String(formData.get("type") || "WORD_CONNECT");

  if (!title) return;

  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const game = await db.gameTemplate.create({
    data: {
      title,
      slug,
      description: description || null,
      type: type as any,
      active: true,
    },
  });

  revalidatePath("/admin/game");
  redirect(`/admin/game/${game.id}`);
}

/* -------------------------
   Page
------------------------- */
export default async function NewGamePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const role = (session.user as any)?.role;
  if (role !== "ADMIN") redirect("/");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Criar novo jogo</h1>
        <p className="text-sm text-muted-foreground">
          Crie um template base. Depois você poderá adicionar níveis, letras e
          palavras.
        </p>
      </header>

      {/* Form */}
      <Card className="p-6">
        <form action={createGame} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Palavra do Dia"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descrição opcional do jogo"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo do jogo</Label>
            <Select name="type" defaultValue="WORD_CONNECT">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WORD_CONNECT">
                  Word Connect
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" asChild>
              <a href="/admin/game">Cancelar</a>
            </Button>

            <Button type="submit">
              Criar jogo
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
