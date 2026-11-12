// app/admin/game/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ChevronRight, Coins, Layers, Trophy, Users2 } from "lucide-react";
import { apiGetOrNull } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { BackButton } from "@/components/ui/back-button";
import { cn } from "@/lib/utils";
import { requireAdmin } from "../../_lib/auth";
import { formatDate, INT, PCT } from "../../_lib/format";
import { SectionTitle, StatTile } from "../../_components/StatTile";
import { GameActiveSwitch, GameFormDialog, NewLevelButton } from "../_components/GameControls";

type Level = {
  id: string;
  order: number;
  letters: string[];
  _count: { words: number };
  stats: { started: number; completed: number; avgAttempts: number; avgTimeSpent: number };
};

type Game = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  stats: { players: number; completed: number; avgCoins: number };
  levels: Level[];
};

const duration = (seconds: number) =>
  seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}min${seconds % 60 ? ` ${seconds % 60}s` : ""}`;

export default async function AdminGameEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const game = await apiGetOrNull<Game>(`/admin/games/${(await params).id}`);
  if (!game) notFound();

  const words = game.levels.reduce((sum, level) => sum + level._count.words, 0);
  const incomplete = game.levels.filter((level) => !level.letters.length || !level._count.words);
  // O app ainda não grava tentativas nem tempo; sem dado, as colunas somem em vez de mostrar zeros.
  const hasEffortData = game.levels.some((level) => level.stats.avgAttempts > 0 || level.stats.avgTimeSpent > 0);
  const funnelBase = Math.max(1, game.stats.players, ...game.levels.map((level) => level.stats.started));
  const hardest = game.levels
    .filter((level) => level.stats.started >= 3)
    .sort((a, b) => a.stats.completed / a.stats.started - b.stats.completed / b.stats.started)[0];

  return (
    <section className="space-y-6">
      <BackButton href="/admin/game" label="Jogos" />

      <header className="flex flex-col gap-4 animate-glass-in sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">{game.title}</h1>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", game.active ? "bg-emerald-100/80 text-emerald-800" : "bg-slate-200/80 text-slate-700")}>
              {game.active ? "Ativo no app" : "Inativo"}
            </span>
          </div>
          <p className="text-sm text-[var(--liquid-muted)]">
            /{game.slug} · Word Connect · criado em {formatDate(game.createdAt)}
          </p>
          {game.description && <p className="mt-1 max-w-2xl text-sm text-[var(--liquid-ink)]">{game.description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-[var(--liquid-muted)]">
            <GameActiveSwitch id={game.id} title={game.title} active={game.active} /> Ativo
          </span>
          <GameFormDialog game={{ id: game.id, title: game.title, description: game.description, active: game.active }} trigger="icon" />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Jogadores" value={INT.format(game.stats.players)} icon={Users2} tone="blue" />
        <StatTile
          label="Concluíram"
          value={INT.format(game.stats.completed)}
          icon={Trophy}
          tone="green"
          hint={`${PCT.format(game.stats.players ? game.stats.completed / game.stats.players : 0)} dos jogadores`}
        />
        <StatTile label="Moedas médias" value={INT.format(game.stats.avgCoins)} icon={Coins} tone="orange" hint="por jogador" />
        <StatTile label="Níveis" value={INT.format(game.levels.length)} icon={Layers} tone="violet" hint={`${INT.format(words)} palavras`} />
      </div>

      {(incomplete.length > 0 || hardest) && (
        <div className="flex flex-wrap gap-2">
          {incomplete.length > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50/80 px-3 py-1.5 text-sm font-medium text-amber-900">
              <AlertTriangle className="size-4" aria-hidden />
              {incomplete.length === 1 ? "Nível" : "Níveis"} {incomplete.map((level) => level.order).join(", ")} ainda sem letras ou palavras
            </span>
          )}
          {hardest && hardest.stats.completed / hardest.stats.started < 0.6 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200/70 bg-red-50/80 px-3 py-1.5 text-sm font-medium text-red-800">
              Nível {hardest.order} é o mais difícil: só {PCT.format(hardest.stats.completed / hardest.stats.started)} concluem
            </span>
          )}
        </div>
      )}

      <GlassCard strong padding="none">
        <div className="p-5 pb-3">
          <SectionTitle
            title="Níveis"
            description="Quantos jogadores começam e concluem cada nível · toque para editar"
            action={<NewLevelButton gameId={game.id} />}
          />
        </div>

        {game.levels.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 pb-12 pt-6 text-center">
            <Layers className="size-8 text-[var(--liquid-muted)]" aria-hidden />
            <p className="text-sm text-[var(--liquid-muted)]">Nenhum nível ainda. Adicione o primeiro para o jogo ficar jogável.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-y border-black/5 text-left text-xs text-[var(--liquid-muted)]">
                  <th className="py-2 pl-5 pr-3 font-medium">Nível</th>
                  <th className="px-3 py-2 font-medium">Letras</th>
                  <th className="px-3 py-2 text-right font-medium">Palavras</th>
                  <th className="px-3 py-2 font-medium">Jogadores (começaram → concluíram)</th>
                  {hasEffortData && <th className="px-3 py-2 text-right font-medium">Tentativas</th>}
                  {hasEffortData && <th className="px-3 py-2 text-right font-medium">Tempo médio</th>}
                  <th className="w-10 pr-5" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {game.levels.map((level) => {
                  const href = `/admin/game/${game.id}/level/${level.id}`;
                  const missing = !level.letters.length || !level._count.words;
                  const rate = level.stats.started ? level.stats.completed / level.stats.started : 0;
                  return (
                    <tr key={level.id} className="group border-b border-black/5 transition-colors last:border-0 hover:bg-white/55">
                      <td className="py-3 pl-5 pr-3">
                        <Link href={href} className="flex items-center gap-2 font-semibold text-[var(--liquid-ink)] group-hover:underline">
                          <span className="flex size-7 items-center justify-center rounded-lg bg-[#7c5cd6]/12 text-xs text-[#6446c2]">{level.order}</span>
                          Nível {level.order}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        {level.letters.length ? (
                          <span className="flex flex-wrap gap-1">
                            {level.letters.map((letter, index) => (
                              <span key={index} className="flex size-6 items-center justify-center rounded-md bg-white/80 font-mono text-xs font-bold text-[var(--liquid-ink)] shadow-sm">
                                {letter}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-700">sem letras</span>
                        )}
                      </td>
                      <td className={cn("px-3 py-3 text-right tabular-nums", !level._count.words && "text-amber-700")}>
                        {INT.format(level._count.words)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="relative h-2 w-40 rounded-full bg-black/5">
                            <div className="absolute inset-y-0 left-0 rounded-full bg-[#2a78d6]/35" style={{ width: `${(level.stats.started / funnelBase) * 100}%` }} />
                            <div className="absolute inset-y-0 left-0 rounded-full bg-[#1baf7a]" style={{ width: `${(level.stats.completed / funnelBase) * 100}%` }} />
                          </div>
                          <span className="whitespace-nowrap text-xs tabular-nums text-[var(--liquid-muted)]">
                            {INT.format(level.stats.started)} → <span className="font-semibold text-[var(--liquid-ink)]">{INT.format(level.stats.completed)}</span>
                            {level.stats.started > 0 && ` (${PCT.format(rate)})`}
                          </span>
                        </div>
                      </td>
                      {hasEffortData && (
                        <td className="px-3 py-3 text-right tabular-nums">{level.stats.avgAttempts ? level.stats.avgAttempts.toLocaleString("pt-BR") : "—"}</td>
                      )}
                      {hasEffortData && (
                        <td className="px-3 py-3 text-right tabular-nums">{level.stats.avgTimeSpent ? duration(level.stats.avgTimeSpent) : "—"}</td>
                      )}
                      <td className="pr-5">
                        <Link href={href} aria-label={`Editar nível ${level.order}`}>
                          {missing ? (
                            <AlertTriangle className="size-4 text-amber-600" aria-hidden />
                          ) : (
                            <ChevronRight className="size-4 text-[var(--liquid-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
                          )}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center gap-4 border-t border-black/5 px-5 py-3 text-xs text-[var(--liquid-muted)]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-[#2a78d6]/35" aria-hidden /> Começaram</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-[#1baf7a]" aria-hidden /> Concluíram</span>
        </div>
      </GlassCard>
    </section>
  );
}
