// app/admin/quiz/[quizId]/page.tsx
import { notFound } from "next/navigation";
import { AlertTriangle, Check, Clock, Medal, Target, Trophy, Users2 } from "lucide-react";
import { apiGetOrNull } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { BackButton } from "@/components/ui/back-button";
import { cn } from "@/lib/utils";
import { requireAdmin } from "../../_lib/auth";
import { formatDate, INT, PCT } from "../../_lib/format";
import { SectionTitle, StatTile } from "../../_components/StatTile";
import { DeleteQuestionButton, QuestionDialog, QuizActiveSwitch, QuizFormDialog } from "../_components/QuizControls";

type Option = { id: string; text: string; isCorrect: boolean; picks: number };
type Question = { id: string; title: string; order: number; options: Option[]; stats: { total: number; correct: number } };
type Quiz = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  active: boolean;
  timeLimit: number | null;
  pointsPerHit: number;
  createdAt: string;
  questions: Question[];
  stats: { sessions: number; completed: number; avgScore: number; bestScore: number; maxScore: number };
  ranking: { id: string; name: string; score: number; endedAt: string | null }[];
};

/** Poucas respostas não dizem nada sobre a dificuldade. */
const MIN_ANSWERS = 5;

export default async function AdminQuizDetailPage({ params }: { params: Promise<{ quizId: string }> }) {
  await requireAdmin();
  const quiz = await apiGetOrNull<Quiz>(`/admin/quizzes/${(await params).quizId}`);
  if (!quiz) notFound();

  const { stats } = quiz;
  const measured = quiz.questions.filter((question) => question.stats.total >= MIN_ANSWERS);
  const accuracyOf = (question: Question) => (question.stats.total ? question.stats.correct / question.stats.total : 0);
  const hardest = [...measured].sort((a, b) => accuracyOf(a) - accuracyOf(b))[0];
  const settings = {
    title: quiz.title,
    description: quiz.description ?? "",
    coverUrl: quiz.coverUrl ?? "",
    active: quiz.active,
    timeLimit: quiz.timeLimit,
    pointsPerHit: quiz.pointsPerHit,
    id: quiz.id,
  };

  return (
    <section className="space-y-6">
      <BackButton href="/admin/quiz" label="Quizzes" />

      <header className="flex flex-col gap-4 animate-glass-in sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {quiz.coverUrl && (
             
            <img src={quiz.coverUrl} alt="" className="hidden size-16 shrink-0 rounded-2xl object-cover shadow-sm sm:block" />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">{quiz.title}</h1>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", quiz.active ? "bg-emerald-100/80 text-emerald-800" : "bg-slate-200/80 text-slate-700")}>
                {quiz.active ? "Ativo no app" : "Inativo"}
              </span>
            </div>
            <p className="flex flex-wrap items-center gap-x-3 text-sm text-[var(--liquid-muted)]">
              <span>{quiz.pointsPerHit} pontos por acerto</span>
              <span className="flex items-center gap-1"><Clock className="size-3.5" aria-hidden /> {quiz.timeLimit ? `${quiz.timeLimit}s` : "sem limite de tempo"}</span>
              <span>criado em {formatDate(quiz.createdAt)}</span>
            </p>
            {quiz.description && <p className="mt-1 max-w-2xl text-sm text-[var(--liquid-ink)]">{quiz.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-[var(--liquid-muted)]">
            <QuizActiveSwitch id={quiz.id} title={quiz.title} active={quiz.active} /> Ativo
          </span>
          <QuizFormDialog quiz={settings} questionCount={quiz.questions.length} />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Partidas" value={INT.format(stats.sessions)} icon={Users2} tone="blue" hint={`${INT.format(stats.completed)} terminadas`} />
        <StatTile
          label="Taxa de conclusão"
          value={PCT.format(stats.sessions ? stats.completed / stats.sessions : 0)}
          icon={Check}
          tone="green"
          hint="começaram e responderam tudo"
        />
        <StatTile
          label="Pontuação média"
          value={stats.completed ? INT.format(stats.avgScore) : "—"}
          icon={Target}
          tone="violet"
          hint={stats.maxScore ? `de ${INT.format(stats.maxScore)} possíveis · ${PCT.format(stats.avgScore / stats.maxScore)}` : undefined}
        />
        <StatTile label="Melhor pontuação" value={stats.completed ? INT.format(stats.bestScore) : "—"} icon={Trophy} tone="orange" />
      </div>

      {(quiz.questions.length === 0 || (hardest && accuracyOf(hardest) < 0.5)) && (
        <div className="flex flex-wrap gap-2">
          {quiz.questions.length === 0 && quiz.active && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50/80 px-3 py-1.5 text-sm font-medium text-amber-900">
              <AlertTriangle className="size-4" aria-hidden /> Ativo sem perguntas: o quiz aparece vazio no app
            </span>
          )}
          {hardest && accuracyOf(hardest) < 0.5 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200/70 bg-red-50/80 px-3 py-1.5 text-sm font-medium text-red-800">
              Pergunta {hardest.order} é a mais difícil: só {PCT.format(accuracyOf(hardest))} acertam
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard strong className="lg:col-span-2">
          <SectionTitle
            title={`Perguntas · ${quiz.questions.length}`}
            description="Acerto e escolhas de cada alternativa"
            action={<QuestionDialog quizId={quiz.id} number={quiz.questions.length + 1} />}
          />

          {quiz.questions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Target className="size-8 text-[var(--liquid-muted)]" aria-hidden />
              <p className="text-sm text-[var(--liquid-muted)]">Nenhuma pergunta ainda. Adicione a primeira para o quiz ficar jogável.</p>
            </div>
          ) : (
            <ol className="grid gap-3">
              {quiz.questions.map((question, index) => {
                const accuracy = accuracyOf(question);
                const enough = question.stats.total >= MIN_ANSWERS;
                return (
                  <li key={question.id} className="rounded-2xl border border-white/70 bg-white/55 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#2a78d6]/12 text-xs font-bold text-[#2a78d6]">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[var(--liquid-ink)]">{question.title}</p>
                        <p className="mt-0.5 text-xs text-[var(--liquid-muted)]">
                          {question.stats.total ? (
                            <>
                              <span
                                className={cn(
                                  "font-semibold",
                                  !enough ? "text-[var(--liquid-muted)]" : accuracy >= 0.7 ? "text-emerald-700" : accuracy >= 0.4 ? "text-amber-700" : "text-red-700",
                                )}
                              >
                                {PCT.format(accuracy)} de acerto
                              </span>{" "}
                              em {INT.format(question.stats.total)} {question.stats.total === 1 ? "resposta" : "respostas"}
                              {!enough && " · poucas respostas para avaliar"}
                            </>
                          ) : (
                            "Ainda sem respostas"
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center">
                        <QuestionDialog quizId={quiz.id} number={index + 1} question={question} />
                        <DeleteQuestionButton quizId={quiz.id} questionId={question.id} number={index + 1} answered={question.stats.total} />
                      </div>
                    </div>

                    <ul className="mt-3 grid gap-1.5 pl-10">
                      {question.options.map((option, optionIndex) => {
                        const share = question.stats.total ? option.picks / question.stats.total : 0;
                        return (
                          <li key={option.id} className="relative overflow-hidden rounded-lg">
                            <div
                              className={cn("absolute inset-y-0 left-0", option.isCorrect ? "bg-emerald-200/60" : "bg-black/[0.05]")}
                              style={{ width: `${share * 100}%` }}
                              aria-hidden
                            />
                            <div
                              className={cn(
                                "relative flex items-center gap-2 px-2.5 py-1.5 text-sm",
                                option.isCorrect ? "font-medium text-emerald-900" : "text-[var(--liquid-ink)]",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                  option.isCorrect ? "bg-emerald-500 text-white" : "bg-black/5 text-[var(--liquid-muted)]",
                                )}
                              >
                                {option.isCorrect ? <Check className="size-3" aria-label="Correta" /> : String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="min-w-0 flex-1">{option.text}</span>
                              {question.stats.total > 0 && (
                                <span className="shrink-0 text-xs tabular-nums text-[var(--liquid-muted)]">{PCT.format(share)}</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ol>
          )}
        </GlassCard>

        <GlassCard strong className="self-start">
          <SectionTitle title="Ranking" description="Melhores pontuações de quem terminou" />
          {quiz.ranking.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--liquid-muted)]">Ninguém terminou ainda.</p>
          ) : (
            <ol className="grid gap-1">
              {quiz.ranking.map((entry, index) => (
                <li key={entry.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      index === 0 ? "bg-amber-100 text-amber-800" : index === 1 ? "bg-slate-200 text-slate-700" : index === 2 ? "bg-orange-100 text-orange-800" : "bg-black/5 text-[var(--liquid-muted)]",
                    )}
                  >
                    {index < 3 ? <Medal className="size-3.5" aria-label={`${index + 1}º`} /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[var(--liquid-ink)]">{entry.name}</span>
                    {entry.endedAt && <span className="block text-xs text-[var(--liquid-muted)]">{formatDate(entry.endedAt)}</span>}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--liquid-ink)]">
                    {INT.format(entry.score)}
                    {stats.maxScore > 0 && <span className="text-xs font-normal text-[var(--liquid-muted)]">/{INT.format(stats.maxScore)}</span>}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </GlassCard>
      </div>
    </section>
  );
}
