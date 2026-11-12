// app/admin/game/page.tsx
import Link from "next/link";
import { AlertTriangle, ChevronRight, Gamepad2, Layers, Trophy, Users2 } from "lucide-react";
import { apiGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { requireAdmin } from "../_lib/auth";
import { INT, PCT } from "../_lib/format";
import { StatTile } from "../_components/StatTile";
import { GameActiveSwitch, GameFormDialog } from "./_components/GameControls";

type Game = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  active: boolean;
  _count: { levels: number; playerGames: number };
  stats: { players: number; completed: number; newPlayers30d: number; words: number; incompleteLevels: number };
};

export default async function AdminGamePage({ searchParams }: { searchParams?: Promise<{ novo?: string }> }) {
  await requireAdmin();
  const openCreate = (await searchParams)?.novo === "1";
  const games = await apiGet<Game[]>("/admin/games");

  const active = games.filter((game) => game.active).length;
  const players = games.reduce((sum, game) => sum + game.stats.players, 0);
  const completed = games.reduce((sum, game) => sum + game.stats.completed, 0);
  const recent = games.reduce((sum, game) => sum + game.stats.newPlayers30d, 0);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 animate-glass-in sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Game</h1>
          <p className="text-sm text-[var(--liquid-muted)]">Jogos de palavras do app: níveis, letras e palavras.</p>
        </div>
        <GameFormDialog defaultOpen={openCreate} />
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Jogos" value={INT.format(games.length)} icon={Gamepad2} tone="violet" hint={`${INT.format(active)} ativos`} />
        <StatTile label="Jogadores" value={INT.format(players)} icon={Users2} tone="blue" hint={`${INT.format(recent)} novos em 30 dias`} />
        <StatTile label="Concluíram um jogo" value={INT.format(completed)} icon={Trophy} tone="green" hint={`${PCT.format(players ? completed / players : 0)} dos jogadores`} />
        <StatTile
          label="Níveis"
          value={INT.format(games.reduce((sum, game) => sum + game._count.levels, 0))}
          icon={Layers}
          tone="orange"
          hint={`${INT.format(games.reduce((sum, game) => sum + game.stats.words, 0))} palavras`}
        />
      </div>

      {games.length === 0 ? (
        <GlassCard strong className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#7c5cd6]/12 text-[#6446c2]">
            <Gamepad2 className="size-6" aria-hidden />
          </span>
          <p className="font-medium text-[var(--liquid-ink)]">Nenhum jogo criado ainda</p>
          <p className="max-w-sm text-sm text-[var(--liquid-muted)]">Crie o primeiro jogo e monte os níveis com letras e palavras.</p>
          <GameFormDialog />
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game, index) => {
            const completion = game.stats.players ? game.stats.completed / game.stats.players : 0;
            return (
              <GlassCard key={game.id} strong padding="none" className="flex flex-col overflow-hidden" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
                <Link href={`/admin/game/${game.id}`} className="group flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", game.active ? "bg-[#7c5cd6]/12 text-[#6446c2]" : "bg-black/5 text-[var(--liquid-muted)]")}>
                      <Gamepad2 className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-[var(--liquid-ink)] group-hover:underline">{game.title}</span>
                      <span className="block truncate text-xs text-[var(--liquid-muted)]">/{game.slug} · Word Connect</span>
                    </span>
                    <ChevronRight className="mt-1 size-4 shrink-0 text-[var(--liquid-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </div>

                  {game.description && <p className="line-clamp-2 text-sm text-[var(--liquid-muted)]">{game.description}</p>}

                  <dl className="grid grid-cols-3 gap-2 text-center">
                    {[
                      ["Níveis", game._count.levels],
                      ["Palavras", game.stats.words],
                      ["Jogadores", game.stats.players],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-white/55 px-2 py-2">
                        <dt className="text-[11px] text-[var(--liquid-muted)]">{label}</dt>
                        <dd className="font-bold tabular-nums text-[var(--liquid-ink)]">{INT.format(Number(value))}</dd>
                      </div>
                    ))}
                  </dl>

                  <div>
                    <div className="mb-1 flex justify-between text-xs text-[var(--liquid-muted)]">
                      <span>Conclusão</span>
                      <span className="tabular-nums">
                        {INT.format(game.stats.completed)} · <span className="font-semibold text-[var(--liquid-ink)]">{PCT.format(completion)}</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/5">
                      <div className="h-full rounded-full bg-[#1baf7a]" style={{ width: `${completion * 100}%` }} />
                    </div>
                  </div>

                  {game.stats.incompleteLevels > 0 && (
                    <p className="flex items-center gap-1.5 rounded-lg bg-amber-50/80 px-2.5 py-1.5 text-xs font-medium text-amber-800">
                      <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
                      {game.stats.incompleteLevels === 1 ? "1 nível sem letras ou palavras" : `${game.stats.incompleteLevels} níveis sem letras ou palavras`}
                    </p>
                  )}
                </Link>

                <div className="flex items-center justify-between gap-3 border-t border-white/60 px-5 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", game.active ? "bg-emerald-100/80 text-emerald-800" : "bg-slate-200/80 text-slate-700")}>
                    {game.active ? "Ativo no app" : "Inativo"}
                  </span>
                  <GameActiveSwitch id={game.id} title={game.title} active={game.active} />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </section>
  );
}
