"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "../../_components/ConfirmDialog";
import {
  createQuestionAction,
  createQuizAction,
  deleteQuestionAction,
  type QuestionInput,
  type QuizInput,
  updateQuestionAction,
  updateQuizAction,
} from "../actions";

export type QuizFields = QuizInput & { id?: string };

const EMPTY_QUIZ: QuizInput = { title: "", description: "", coverUrl: "", active: true, timeLimit: null, pointsPerHit: 10 };

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p>;
}

/** Cria (sem `quiz`) ou edita as configurações de um quiz. */
export function QuizFormDialog({
  quiz,
  defaultOpen = false,
  questionCount = 0,
}: {
  quiz?: QuizFields;
  defaultOpen?: boolean;
  questionCount?: number;
}) {
  const router = useRouter();
  const editing = Boolean(quiz?.id);
  const [open, setOpen] = useState(defaultOpen);
  const [form, setForm] = useState<QuizInput>(quiz ?? EMPTY_QUIZ);
  const [timed, setTimed] = useState(Boolean(quiz?.timeLimit));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setForm(quiz ?? EMPTY_QUIZ);
    setTimed(Boolean(quiz?.timeLimit));
    setError(null);
    // Só ao abrir: recarregar a cada render apagaria o que está sendo digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof QuizInput>(key: K, value: QuizInput[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.title.trim().length < 3) return setError("O título precisa ter pelo menos 3 caracteres.");
    if (!Number.isInteger(form.pointsPerHit) || form.pointsPerHit < 1) return setError("Pontos por acerto: use um número inteiro a partir de 1.");
    if (timed && (!form.timeLimit || form.timeLimit < 10)) return setError("Tempo limite: use pelo menos 10 segundos.");
    const payload: QuizInput = { ...form, title: form.title.trim(), timeLimit: timed ? form.timeLimit : null };
    startTransition(async () => {
      if (editing && quiz?.id) {
        const result = await updateQuizAction(quiz.id, payload);
        if (!result.ok) return setError(result.message);
        setOpen(false);
        router.refresh();
        return;
      }
      const result = await createQuizAction(payload);
      if (!result.ok || !result.data) return setError(result.ok ? "Não foi possível criar o quiz." : result.message);
      router.push(`/admin/quiz/${result.data.id}`);
    });
  };

  const maxScore = questionCount * (form.pointsPerHit || 0);

  return (
    <>
      {editing ? (
        <Button variant="glass" size="sm" className="rounded-full" onClick={() => setOpen(true)}>
          <Pencil className="size-3.5" /> Configurações
        </Button>
      ) : (
        <Button variant="glass-primary" className="rounded-full" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Novo quiz
        </Button>
      )}

      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={submit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{editing ? "Configurações do quiz" : "Novo quiz"}</DialogTitle>
              <DialogDescription>
                {editing ? "Mudanças de pontuação valem para as próximas partidas." : "Depois de criar, você adiciona as perguntas."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-1.5">
              <Label htmlFor="quiz-title">Título</Label>
              <Input id="quiz-title" value={form.title} maxLength={300} onChange={(e) => set("title", e.target.value)} placeholder="Ex.: Quiz bíblico – Gênesis" autoFocus />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="quiz-description">Descrição</Label>
              <Textarea id="quiz-description" rows={2} value={form.description} maxLength={5000} onChange={(e) => set("description", e.target.value)} placeholder="Opcional" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="quiz-cover">Imagem de capa (URL)</Label>
              <div className="flex items-center gap-3">
                <Input id="quiz-cover" value={form.coverUrl} maxLength={2048} onChange={(e) => set("coverUrl", e.target.value)} placeholder="https://… (opcional)" />
                {form.coverUrl.startsWith("http") && (
                   
                  <img src={form.coverUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="quiz-points">Pontos por acerto</Label>
                <Input id="quiz-points" type="number" min={1} value={form.pointsPerHit} onChange={(e) => set("pointsPerHit", Number(e.target.value))} />
                {questionCount > 0 && <p className="text-xs text-slate-500">Máximo de {maxScore} pontos com {questionCount} perguntas.</p>}
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiz-time">Tempo limite</Label>
                  <Switch checked={timed} onCheckedChange={setTimed} aria-label="Usar tempo limite" />
                </div>
                <div className="relative">
                  <Input
                    id="quiz-time"
                    type="number"
                    min={10}
                    disabled={!timed}
                    value={timed ? (form.timeLimit ?? "") : ""}
                    onChange={(e) => set("timeLimit", e.target.value ? Number(e.target.value) : null)}
                    placeholder={timed ? "60" : "Sem limite"}
                    className="pr-10"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">seg</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div>
                <Label htmlFor="quiz-active">Disponível para os leitores</Label>
                <p className="text-xs text-slate-500">
                  {questionCount === 0 && form.active ? "Atenção: sem perguntas, o quiz aparece vazio no app." : "Desativado, o quiz some do app."}
                </p>
              </div>
              <Switch id="quiz-active" checked={form.active} onCheckedChange={(value) => set("active", value)} />
            </div>

            {error && <ErrorText>{error}</ErrorText>}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={pending}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending && <ButtonSpinner />} {editing ? "Salvar" : "Criar e adicionar perguntas"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function QuizActiveSwitch({ id, title, active }: { id: string; title: string; active: boolean }) {
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
      const result = await updateQuizAction(id, { active: next });
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
        title="Desativar quiz?"
        description={<>O quiz <b>{title}</b> deixa de aparecer no app. Partidas e pontuações são mantidas.</>}
        confirmLabel="Desativar"
        destructive
        pending={pending}
        error={error}
        onConfirm={() => apply(false)}
      />
    </>
  );
}

type Option = { id?: string; text: string; isCorrect: boolean };

/** Cria ou edita uma pergunta. Na edição, as alternativas existentes são mantidas (a API só atualiza o texto e a correta). */
export function QuestionDialog({
  quizId,
  question,
  number,
}: {
  quizId: string;
  question?: { id: string; title: string; options: Option[] };
  number: number;
}) {
  const router = useRouter();
  const editing = Boolean(question);
  const initial = (): { title: string; options: Option[] } =>
    question
      ? { title: question.title, options: question.options.map(({ id, text, isCorrect }) => ({ id, text, isCorrect })) }
      : { title: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setForm(initial());
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setOption = (index: number, patch: Partial<Option>) =>
    setForm((current) => ({
      ...current,
      options: current.options.map((option, position) =>
        patch.isCorrect ? { ...option, isCorrect: position === index } : position === index ? { ...option, ...patch } : option,
      ),
    }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const title = form.title.trim();
    const options = form.options.map((option) => ({ ...option, text: option.text.trim() }));
    if (title.length < 3) return setError("O enunciado precisa ter pelo menos 3 caracteres.");
    if (options.some((option) => !option.text)) return setError("Preencha todas as alternativas ou remova as vazias.");
    if (new Set(options.map((option) => option.text.toLocaleLowerCase("pt-BR"))).size !== options.length) {
      return setError("Há alternativas repetidas.");
    }
    if (options.filter((option) => option.isCorrect).length !== 1) return setError("Marque exatamente uma alternativa correta.");
    const input: QuestionInput = { title, options };
    startTransition(async () => {
      const result = question ? await updateQuestionAction(quizId, question.id, input) : await createQuestionAction(quizId, input);
      if (!result.ok) return setError(result.message);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      {editing ? (
        <Button variant="ghost" size="icon" className="size-8 rounded-full text-[var(--liquid-muted)]" onClick={() => setOpen(true)} aria-label={`Editar pergunta ${number}`}>
          <Pencil className="size-4" />
        </Button>
      ) : (
        <Button variant="glass-primary" size="sm" className="rounded-full" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Nova pergunta
        </Button>
      )}

      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={submit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{editing ? `Editar pergunta ${number}` : `Pergunta ${number}`}</DialogTitle>
              <DialogDescription>Escreva o enunciado e toque no círculo da alternativa correta.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-1.5">
              <Label htmlFor="question-title">Enunciado</Label>
              <Textarea
                id="question-title"
                rows={2}
                maxLength={2000}
                value={form.title}
                onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                placeholder="Ex.: Quantos dias durou a criação?"
                autoFocus
              />
            </div>

            <fieldset className="grid gap-2">
              <legend className="mb-1.5 text-sm font-medium">Alternativas</legend>
              {form.options.map((option, index) => (
                <div
                  key={option.id ?? index}
                  className={cn("flex items-center gap-2 rounded-xl border p-1.5 pl-2 transition-colors", option.isCorrect && "border-emerald-300 bg-emerald-50/60")}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={option.isCorrect}
                    aria-label={`Marcar alternativa ${String.fromCharCode(65 + index)} como correta`}
                    onClick={() => setOption(index, { isCorrect: true })}
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                      option.isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-slate-500 hover:border-emerald-400",
                    )}
                  >
                    {option.isCorrect ? <Check className="size-3.5" /> : String.fromCharCode(65 + index)}
                  </button>
                  <Input
                    value={option.text}
                    maxLength={1000}
                    onChange={(e) => setOption(index, { text: e.target.value })}
                    placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                    aria-label={`Alternativa ${String.fromCharCode(65 + index)}`}
                    className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0"
                  />
                  {!editing && form.options.length > 2 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 text-slate-400 hover:text-red-600"
                      aria-label={`Remover alternativa ${String.fromCharCode(65 + index)}`}
                      onClick={() =>
                        setForm((current) => {
                          const options = current.options.filter((_, position) => position !== index);
                          if (!options.some((item) => item.isCorrect)) options[0] = { ...options[0], isCorrect: true };
                          return { ...current, options };
                        })
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              {editing ? (
                <p className="text-xs text-slate-500">Para mudar a quantidade de alternativas, exclua a pergunta e crie outra.</p>
              ) : (
                form.options.length < 6 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-fit"
                    onClick={() => setForm((current) => ({ ...current, options: [...current.options, { text: "", isCorrect: false }] }))}
                  >
                    <Plus className="size-3.5" /> Alternativa
                  </Button>
                )
              )}
            </fieldset>

            {error && <ErrorText>{error}</ErrorText>}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={pending}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending && <ButtonSpinner />} Salvar pergunta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DeleteQuestionButton({ quizId, questionId, number, answered }: { quizId: string; questionId: string; number: number; answered: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-full text-[var(--liquid-muted)] hover:bg-red-50 hover:text-red-700"
        onClick={() => setOpen(true)}
        aria-label={`Excluir pergunta ${number}`}
      >
        <Trash2 className="size-4" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={answered > 0 ? "Pergunta já respondida" : `Excluir pergunta ${number}?`}
        description={
          answered > 0
            ? `Ela já foi respondida ${answered} ${answered === 1 ? "vez" : "vezes"} e faz parte do histórico das partidas, por isso não pode ser excluída. Você pode corrigir o texto pelo lápis ou desativar o quiz.`
            : "Esta ação não pode ser desfeita."
        }
        confirmLabel={answered > 0 ? "Entendi" : "Excluir"}
        destructive={answered === 0}
        pending={pending}
        error={error}
        onConfirm={() =>
          answered > 0 ? setOpen(false) : startTransition(async () => {
            const result = await deleteQuestionAction(quizId, questionId);
            if (!result.ok) return setError(result.message);
            setOpen(false);
            router.refresh();
          })
        }
      />
    </>
  );
}
