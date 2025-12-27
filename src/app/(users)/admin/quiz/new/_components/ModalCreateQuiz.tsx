"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createQuizAction } from "../actions";

interface Props {
  openDefault?: boolean;
}

export function ModalCreateQuiz({ openDefault }: Props) {
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: "",
    description: "",
    coverUrl: "",
    active: true,
    timeLimit: undefined as number | undefined,
    pointsPerHit: 10,
  });

  function handleSubmit() {
    startTransition(async () => {
      const res = await createQuizAction(form);

      if (res.success) {
        window.location.href = `/admin/quiz/${res.quizId}`;
      } else {
        alert(res.message);
      }
    });
  }

  return (
    <form
      className="space-y-5"
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
          placeholder="Ex: Quiz Bíblico – Gênesis"
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
          placeholder="Explique o objetivo do quiz"
          rows={3}
        />
      </div>

      {/* TEMPO */}
      <div className="space-y-2">
        <Label>Tempo limite (segundos)</Label>
        <Input
          type="number"
          min={10}
          value={form.timeLimit ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              timeLimit: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          placeholder="Opcional"
        />
      </div>

      {/* PONTOS */}
      <div className="space-y-2">
        <Label>Pontos por acerto</Label>
        <Input
          type="number"
          min={1}
          value={form.pointsPerHit}
          onChange={(e) =>
            setForm({
              ...form,
              pointsPerHit: Number(e.target.value),
            })
          }
        />
      </div>

      {/* ATIVO */}
      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <Label>Ativo</Label>
          <p className="text-xs text-muted-foreground">
            Controla se o quiz aparece para os leitores
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
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Criando..." : "Criar Quiz"}
        </Button>
      </div>
    </form>
  );
}
