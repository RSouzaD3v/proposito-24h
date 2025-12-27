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
import { Pencil } from "lucide-react";
import { updateQuizQuestionAction } from "../actions";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Props {
  quizId: string;
  questionId: string;
  initialTitle: string;
  initialOptions: Option[];
}

export function ModalEditQuestion({
  quizId,
  questionId,
  initialTitle,
  initialOptions,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialTitle);
  const [options, setOptions] = useState<Option[]>(initialOptions);

  function markCorrect(index: number) {
    setOptions((prev) =>
      prev.map((o, i) => ({
        ...o,
        isCorrect: i === index,
      }))
    );
  }

  function handleSubmit() {
    startTransition(async () => {
      const res = await updateQuizQuestionAction({
        quizId,
        questionId,
        title,
        options,
      });

      if (res.success) {
        setOpen(false);
      } else {
        alert(res.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Pencil size={14} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar pergunta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* PERGUNTA */}
          <div className="space-y-1">
            <Label>Pergunta</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* ALTERNATIVAS */}
          <div className="space-y-3">
            <Label>Alternativas</Label>

            {options.map((opt, index) => (
              <div
                key={opt.id}
                className="flex items-center gap-2"
              >
                <input
                  type="radio"
                  checked={opt.isCorrect}
                  onChange={() => markCorrect(index)}
                />

                <Input
                  value={opt.text}
                  onChange={(e) =>
                    setOptions((prev) =>
                      prev.map((o, i) =>
                        i === index
                          ? { ...o, text: e.target.value }
                          : o
                      )
                    )
                  }
                />
              </div>
            ))}
          </div>

          {/* AÇÕES */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>

            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
