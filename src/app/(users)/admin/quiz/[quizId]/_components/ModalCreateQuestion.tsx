"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { createQuizQuestionAction } from "../../actions";

export function ModalCreateQuestion({ quizId }: { quizId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ]);

  function handleSubmit() {
    startTransition(() => {
      void createQuizQuestionAction({
        quizId,
        title,
        options,
      }).then((res) => {
        if (res.success) {
          setOpen(false);
          setTitle("");
          setOptions([
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
          ]);
        } else {
          alert(res.message);
        }
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus size={16} />
          Nova pergunta
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar pergunta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Enunciado</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite a pergunta"
            />
          </div>

          <div className="space-y-2">
            <Label>Alternativas</Label>

            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="radio"
                  checked={opt.isCorrect}
                  onChange={() =>
                    setOptions(
                      options.map((o, i) => ({
                        ...o,
                        isCorrect: i === idx,
                      }))
                    )
                  }
                />

                <Input
                  value={opt.text}
                  onChange={(e) =>
                    setOptions(
                      options.map((o, i) =>
                        i === idx ? { ...o, text: e.target.value } : o
                      )
                    )
                  }
                  placeholder={`Opção ${idx + 1}`}
                />

                {options.length > 2 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setOptions(options.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setOptions([...options, { text: "", isCorrect: false }])
              }
            >
              + Adicionar alternativa
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar pergunta"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
