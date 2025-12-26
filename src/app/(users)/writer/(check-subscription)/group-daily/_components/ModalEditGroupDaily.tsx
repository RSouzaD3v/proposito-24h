"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { updateGroupingDailyAction } from "../actions";
import S3Uploader from "@/components/S3Uploader";
import { Switch } from "@/components/ui/switch";

interface Props {
  groupId: string;
  initialTitle: string;
  initialDescription?: string | null;
  initialImageUrl?: string | null;
  initialActive: boolean;
}

export function ModalEditGroupDaily({
  groupId,
  initialTitle,
  initialDescription,
  initialImageUrl,
  initialActive,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: initialTitle,
    description: initialDescription ?? "",
    imageUrl: initialImageUrl ?? "",
    active: initialActive,
  });

  /* ======================================================
   * 🔁 SINCRONIZA STATE COM O BANCO AO ABRIR O MODAL
   * ====================================================== */
  useEffect(() => {
    if (open) {
      setForm({
        title: initialTitle,
        description: initialDescription ?? "",
        imageUrl: initialImageUrl ?? "",
        active: initialActive,
      });
    }
  }, [
    open,
    initialTitle,
    initialDescription,
    initialImageUrl,
    initialActive,
  ]);

  function handleSubmit() {
    startTransition(() => {
      void updateGroupingDailyAction({
        groupId,
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl,
        active: form.active,
      }).then((res) => {
        if (res.success) {
          setOpen(false);
        } else {
          alert(res.message);
        }
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil size={14} />
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar agrupamento</DialogTitle>
          <DialogDescription>
            Atualize as informações e a visibilidade do agrupamento diário.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* TÍTULO */}
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />
          </div>

          {/* DESCRIÇÃO */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* IMAGEM */}
          <div className="space-y-2">
            <Label>Imagem</Label>

            <S3Uploader
              folder="group-daily"
              onUploaded={(file) =>
                setForm({ ...form, imageUrl: file.publicUrl })
              }
            />

            {form.imageUrl && (
              <p className="text-xs text-muted-foreground">
                Imagem atual definida
              </p>
            )}
          </div>

          {/* ATIVO */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <Label>Ativo</Label>
              <p className="text-xs text-muted-foreground">
                Controla se este agrupamento aparece para os leitores
              </p>
            </div>

            <Switch
              checked={form.active}
              onCheckedChange={(checked) =>
                setForm({ ...form, active: checked })
              }
            />
          </div>

          {/* AÇÕES */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
