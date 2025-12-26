"use client";

import { useState, useTransition } from "react";
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
import { Plus } from "lucide-react";
import { createGroupingDailyAction } from "../actions";
import S3Uploader from "@/components/S3Uploader";
import { Switch } from "@/components/ui/switch";

export function ModalGroupDaily() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    active: true, // ✅ novo campo
  });

  function handleSubmit() {
    startTransition(async () => {
      const res = await createGroupingDailyAction(form);

      if (res.success) {
        setOpen(false);
        setForm({
          title: "",
          description: "",
          imageUrl: "https://ranetium.com/favicon.ico",
          active: true,
        });
      } else {
        alert(res.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* BOTÃO */}
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          Criar agrupamento diário
        </Button>
      </DialogTrigger>

      {/* MODAL */}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar agrupamento diário</DialogTitle>
          <DialogDescription>
            Crie um agrupamento para organizar citações, passagens,
            devocionais e orações do dia.
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* TÍTULO */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="Ex: Devocional da Manhã"
              required
            />
          </div>

          {/* DESCRIÇÃO */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Descreva o propósito deste agrupamento..."
              rows={3}
            />
          </div>

          {/* IMAGEM VIA S3 */}
          <div className="space-y-2">
            <Label>Imagem</Label>

            {/* Descomente quando quiser ativar */}
            
            <S3Uploader
              folder="group-daily"
              onUploaded={(file) =>
                setForm({ ...form, imageUrl: file.publicUrl })
              }
            /> 
           

            {form.imageUrl && (
              <p className="text-xs text-muted-foreground">
                Imagem definida
              </p>
            )}
          </div>

          {/* ATIVO */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <Label>Ativo</Label>
              <p className="text-xs text-muted-foreground">
                Controla se o agrupamento fica visível para os leitores
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
              {isPending ? "Criando..." : "Criar agrupamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
