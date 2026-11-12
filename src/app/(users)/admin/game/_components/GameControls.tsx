"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import { createGameAction, createLevelAction, updateGameAction } from "../actions";

type GameFields = { id?: string; title: string; description: string | null; active?: boolean };

/** Cria (sem `game`) ou edita um jogo. */
export function GameFormDialog({
  game,
  defaultOpen = false,
  trigger = "button",
}: {
  game?: GameFields;
  defaultOpen?: boolean;
  trigger?: "button" | "icon";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [title, setTitle] = useState(game?.title ?? "");
  const [description, setDescription] = useState(game?.description ?? "");
  const [active, setActive] = useState(game?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editing = Boolean(game?.id);

  useEffect(() => {
    if (!open) return;
    setTitle(game?.title ?? "");
    setDescription(game?.description ?? "");
    setActive(game?.active ?? true);
    setError(null);
    // Só ao abrir: recarregar a cada render apagaria o que está sendo digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 1) return setError("Informe o título.");
    startTransition(async () => {
      if (editing && game?.id) {
        const result = await updateGameAction(game.id, { title: title.trim(), description: description.trim(), active });
        if (!result.ok) return setError(result.message);
        setOpen(false);
        router.refresh();
        return;
      }
      const result = await createGameAction({ title: title.trim(), description: description.trim() });
      if (!result.ok || !result.data) return setError(result.ok ? "Não foi possível criar o jogo." : result.message);
      router.push(`/admin/game/${result.data.id}`);
    });
  };

  return (
    <>
      {trigger === "icon" ? (
        <Button variant="glass" size="sm" className="rounded-full" onClick={() => setOpen(true)}>
          <Pencil className="size-3.5" /> Editar
        </Button>
      ) : (
        <Button variant="glass-primary" className="rounded-full" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Novo jogo
        </Button>
      )}

      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar jogo" : "Novo jogo"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Título e descrição aparecem para os leitores."
                  : "Word Connect: o leitor liga letras para formar palavras. Depois de criar, você adiciona os níveis."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-1.5">
              <Label htmlFor="game-title">Título</Label>
              <Input id="game-title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Palavra do Dia" autoFocus />
              {!editing && <p className="text-xs text-slate-500">O endereço do jogo é gerado a partir do título.</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="game-description">Descrição</Label>
              <Textarea id="game-description" value={description} maxLength={2000} rows={3} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
            </div>
            {editing && (
              <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
                <div>
                  <Label htmlFor="game-active">Disponível para os leitores</Label>
                  <p className="text-xs text-slate-500">Desativado, o jogo some do app sem perder o progresso.</p>
                </div>
                <Switch id="game-active" checked={active} onCheckedChange={setActive} />
              </div>
            )}
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={pending}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending && <ButtonSpinner />} {editing ? "Salvar" : "Criar e adicionar níveis"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Liga/desliga o jogo; desligar pede confirmação porque tira o jogo do app. */
export function GameActiveSwitch({ id, title, active }: { id: string; title: string; active: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(active);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => setChecked(active), [active]);

  const apply = (next: boolean) =>
    startTransition(async () => {
      setError(null);
      setChecked(next);
      const result = await updateGameAction(id, { active: next });
      if (!result.ok) {
        setChecked(!next);
        setError(result.message);
        return;
      }
      setConfirm(false);
      router.refresh();
    });

  return (
    <>
      <Switch
        checked={checked}
        disabled={pending}
        onCheckedChange={(next) => (next ? apply(true) : setConfirm(true))}
        aria-label={checked ? `Desativar ${title}` : `Ativar ${title}`}
      />
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Desativar jogo?"
        description={<>O jogo <b>{title}</b> deixa de aparecer no app. O progresso dos jogadores é mantido.</>}
        confirmLabel="Desativar"
        destructive
        pending={pending}
        error={error}
        onConfirm={() => apply(false)}
      />
    </>
  );
}

export function NewLevelButton({ gameId, variant = "glass-primary" }: { gameId: string; variant?: "glass-primary" | "glass" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={variant}
        size="sm"
        className="rounded-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await createLevelAction(gameId);
            if (!result.ok || !result.data) return setError(result.ok ? "Não foi possível criar o nível." : result.message);
            router.push(`/admin/game/${gameId}/level/${result.data.id}`);
          })
        }
      >
        {pending ? <ButtonSpinner /> : <Plus className="size-4" />} Adicionar nível
      </Button>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
