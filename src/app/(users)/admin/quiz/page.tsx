// app/admin/quiz/page.tsx
import Link from "next/link";
import { AlertTriangle, ChevronRight, Clock, ListChecks, Target, Trophy, Users2 } from "lucide-react";
import { apiGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { requireAdmin } from "../_lib/auth";
import { INT, PCT } from "../_lib/format";
import { StatTile } from "../_components/StatTile";
import { QuizActiveSwitch, QuizFormDialog } from "./_components/QuizControls";

export const dynamic = "force-dynamic";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  active: boolean;
  timeLimit: number | null;
  pointsPerHit: number;
  _count: { questions: number; sessions: number };
  stats: { sessions: number; completed: number; avgScore: number; avgAccuracy: number };
};

export default async function AdminQuizPage({ searchParams }: { searchParams?: Promise<{ novo?: string }> }) {
  await requireAdmin();
  const openCreate = (await searchParams)?.novo === "1";
  const quizzes = await apiGet<Quiz[]>("/admin/quizzes");

  const active = quizzes.filter((quiz) => quiz.active).length;
  const questions = quizzes.reduce((sum, quiz) => sum + quiz._count.questions, 0);
  const sessions = quizzes.reduce((sum, quiz) => sum + quiz.stats.sessions, 0);
  const completed = quizzes.reduce((sum, quiz) => sum + quiz.stats.completed, 0);
  const weightedAccuracy = completed
    ? quizzes.reduce((sum, quiz) => sum + quiz.stats.avgAccuracy * quiz.stats.completed, 0) / completed
    : 0;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 animate-glass-in sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Quiz</h1>
          <p className="text-sm text-[var(--liquid-muted)]">Quizzes do app, perguntas e desempenho dos leitores.</p>
        </div>
        <QuizFormDialog defaultOpen={openCreate} />
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Quizzes" value={INT.format(quizzes.length)} icon={ListChecks} tone="violet" hint={`${INT.format(active)} ativos`} />
        <StatTile label="Perguntas" value={INT.format(questions)} icon={Target} tone="blue" hint={quizzes.length ? `${(questions / quizzes.length).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} por quiz` : undefined} />
        <StatTile label="Partidas" value={INT.format(sessions)} icon={Users2} tone="green" hint={`${PCT.format(sessions ? completed / sessions : 0)} terminadas`} />
        <StatTile label="Aproveitamento médio" value={PCT.format(weightedAccuracy)} icon={Trophy} tone="orange" hint="de quem terminou" />
      </div>

      {quizzes.length === 0 ? (
        <GlassCard strong className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#2a78d6]/12 text-[#2a78d6]">
            <ListChecks className="size-6" aria-hidden />
          </span>
          <p className="font-medium text-[var(--liquid-ink)]">Nenhum quiz criado ainda</p>
          <p className="max-w-sm text-sm text-[var(--liquid-muted)]">Crie o primeiro quiz e adicione perguntas de múltipla escolha.</p>
          <QuizFormDialog />
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz, index) => {
            const completion = quiz.stats.sessions ? quiz.stats.completed / quiz.stats.sessions : 0;
            return (
              <GlassCard key={quiz.id} strong padding="none" className="flex flex-col overflow-hidden" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
                <Link href={`/admin/quiz/${quiz.id}`} className="group flex flex-1 flex-col">
                  <div className={cn("relative h-28 overflow-hidden bg-gradient-to-br from-[#5b9cff] to-[#7c5cd6]", !quiz.active && "grayscale")}>
                    {quiz.coverUrl && (
                       
                      <img src={quiz.coverUrl} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" aria-hidden />
                    <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2 text-white">
                      <span className="text-xs font-medium">
                        {INT.format(quiz._count.questions)} {quiz._count.questions === 1 ? "pergunta" : "perguntas"} · {quiz.pointsPerHit} pts/acerto
                      </span>
                      {quiz.timeLimit && (
                        <span className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-[11px] backdrop-blur">
                          <Clock className="size-3" aria-hidden /> {quiz.timeLimit}s
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="line-clamp-2 font-semibold text-[var(--liquid-ink)] group-hover:underline">{quiz.title}</span>
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-[var(--liquid-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </div>
                    {quiz.description && <p className="line-clamp-2 text-sm text-[var(--liquid-muted)]">{quiz.description}</p>}

                    <dl className="mt-auto grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white/55 px-3 py-2">
                        <dt className="text-[11px] text-[var(--liquid-muted)]">Partidas</dt>
                        <dd className="font-bold tabular-nums text-[var(--liquid-ink)]">
                          {INT.format(quiz.stats.sessions)}
                          <span className="ml-1 text-xs font-normal text-[var(--liquid-muted)]">· {PCT.format(completion)} terminaram</span>
                        </dd>
                      </div>
                      <div className="rounded-xl bg-white/55 px-3 py-2">
                        <dt className="text-[11px] text-[var(--liquid-muted)]">Aproveitamento</dt>
                        <dd className="font-bold tabular-nums text-[var(--liquid-ink)]">{quiz.stats.completed ? PCT.format(quiz.stats.avgAccuracy) : "—"}</dd>
                      </div>
                    </dl>

                    {quiz.active && quiz._count.questions === 0 && (
                      <p className="flex items-center gap-1.5 rounded-lg bg-amber-50/80 px-2.5 py-1.5 text-xs font-medium text-amber-800">
                        <AlertTriangle className="size-3.5 shrink-0" aria-hidden /> Ativo sem perguntas
                      </p>
                    )}
                  </div>
                </Link>

                <div className="flex items-center justify-between gap-3 border-t border-white/60 px-5 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", quiz.active ? "bg-emerald-100/80 text-emerald-800" : "bg-slate-200/80 text-slate-700")}>
                    {quiz.active ? "Ativo no app" : "Inativo"}
                  </span>
                  <QuizActiveSwitch id={quiz.id} title={quiz.title} active={quiz.active} />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </section>
  );
}
