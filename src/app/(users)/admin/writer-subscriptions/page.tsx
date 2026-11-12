// app/admin/writer-subscriptions/page.tsx
import Link from "next/link";
import { CalendarPlus, CalendarX, Repeat, Search, Users2 } from "lucide-react";
import { apiGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requireAdmin } from "../_lib/auth";
import { BRL, CYCLE, deltaOf, formatDate, INT, PCT, RANGES, rangeOf } from "../_lib/format";
import { SectionTitle, StatTile } from "../_components/StatTile";
import { ExportCsvButton } from "../_components/ExportCsvButton";
import { MrrChart, type MrrMonth } from "./_charts/MrrChart";
import { SubscriptionsTable, type WriterSubscription } from "./_components/SubscriptionsTable";

type Data = {
  start: string;
  end: string;
  activeCount: number;
  mrrNow: number;
  newInPeriod: number;
  canceledInPeriod: number;
  previous: { newInPeriod: number; canceledInPeriod: number };
  byInterval: { interval: string; count: number; mrrCents: number }[];
  mrrSeries: MrrMonth[];
  subscriptions: WriterSubscription[];
};

const STATUSES = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Ativas" },
  { key: "ended", label: "Encerradas" },
] as const;

const CYCLE_COLOR: Record<string, string> = { MONTH: "#2a78d6", QUARTER: "#1baf7a", SEMESTER: "#eb6834", YEAR: "#7c5cd6" };

export default async function AdminWriterSubscriptions({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; range?: string }>;
}) {
  await requireAdmin();
  const sp = (await searchParams) ?? {};
  const q = sp.q?.trim() || "";
  const status = STATUSES.find(({ key }) => key === sp.status)?.key ?? "all";
  const range = rangeOf(sp.range);
  const query = new URLSearchParams({ status, range: range.key, ...(q ? { q } : {}) });
  const data = await apiGet<Data>(`/admin/writer-subscriptions?${query}`);

  const href = (patch: Record<string, string>) => {
    const params = new URLSearchParams({ status, range: range.key, ...(q ? { q } : {}), ...patch });
    if (!params.get("q")) params.delete("q");
    return `?${params}`;
  };
  const mrrCents = Math.round(data.mrrNow * 100);
  const lastYear = data.mrrSeries[0]?.mrr ?? 0;
  const yearGrowth = deltaOf(mrrCents, lastYear);
  const arpa = data.activeCount ? mrrCents / data.activeCount : 0;
  const churn = data.activeCount + data.canceledInPeriod ? data.canceledInPeriod / (data.activeCount + data.canceledInPeriod) : 0;
  const cycles = [...data.byInterval].sort((a, b) => (CYCLE[a.interval]?.months ?? 0) - (CYCLE[b.interval]?.months ?? 0));

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 animate-glass-in lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Planos dos escritores</h1>
          <p className="text-sm text-[var(--liquid-muted)]">
            Assinaturas que os escritores pagam à plataforma · {formatDate(data.start)} — {formatDate(data.end)}
          </p>
        </div>
        <nav aria-label="Período" className="glass-surface flex w-fit gap-0.5 rounded-full p-1">
          {RANGES.map(({ key, label }) => (
            <Link
              key={key}
              href={href({ range: key })}
              scroll={false}
              aria-current={key === range.key ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                key === range.key ? "bg-[var(--liquid-accent)] text-white shadow-sm" : "text-[var(--liquid-muted)] hover:bg-white/70",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile
          size="lg"
          label="MRR atual"
          value={BRL.format(data.mrrNow)}
          icon={Repeat}
          tone="green"
          hint={`ARR ${BRL.format(data.mrrNow * 12)}${typeof yearGrowth === "number" ? ` · ${yearGrowth > 0 ? "+" : ""}${yearGrowth}% em 12 meses` : ""}`}
        />
        <StatTile
          size="lg"
          label="Planos ativos"
          value={INT.format(data.activeCount)}
          icon={Users2}
          tone="blue"
          hint={`${BRL.format(arpa / 100)} de MRR médio por escritor`}
        />
        <StatTile
          size="lg"
          label="Novas no período"
          value={INT.format(data.newInPeriod)}
          icon={CalendarPlus}
          tone="violet"
          delta={deltaOf(data.newInPeriod, data.previous.newInPeriod)}
        />
        <StatTile
          size="lg"
          label="Encerradas no período"
          value={INT.format(data.canceledInPeriod)}
          icon={CalendarX}
          tone="rose"
          invert
          delta={deltaOf(data.canceledInPeriod, data.previous.canceledInPeriod)}
          hint={`churn ${PCT.format(churn)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard strong className="lg:col-span-2">
          <SectionTitle title="Evolução nos últimos 12 meses" description="Planos não mensais entram divididos pelo número de meses do ciclo" />
          <MrrChart data={data.mrrSeries} />
        </GlassCard>

        <GlassCard strong>
          <SectionTitle title="Por ciclo de cobrança" description="Planos ativos e participação no MRR" />
          {cycles.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--liquid-muted)]">Nenhum plano ativo.</p>
          ) : (
            <>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-black/5" aria-hidden>
                {cycles.map((cycle) => (
                  <div
                    key={cycle.interval}
                    style={{ width: `${mrrCents ? (cycle.mrrCents / mrrCents) * 100 : 0}%`, background: CYCLE_COLOR[cycle.interval] ?? "#8a94a6" }}
                  />
                ))}
              </div>
              <ul className="mt-4 grid gap-3">
                {cycles.map((cycle) => (
                  <li key={cycle.interval} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: CYCLE_COLOR[cycle.interval] ?? "#8a94a6" }} aria-hidden />
                      <span>
                        <span className="block font-medium text-[var(--liquid-ink)]">{CYCLE[cycle.interval]?.name ?? cycle.interval}</span>
                        <span className="block text-xs text-[var(--liquid-muted)]">
                          {INT.format(cycle.count)} {cycle.count === 1 ? "plano" : "planos"}
                        </span>
                      </span>
                    </span>
                    <span className="text-right tabular-nums">
                      <span className="block font-semibold text-[var(--liquid-ink)]">{BRL.format(cycle.mrrCents / 100)}</span>
                      <span className="block text-xs text-[var(--liquid-muted)]">{PCT.format(mrrCents ? cycle.mrrCents / mrrCents : 0)} do MRR</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </GlassCard>
      </div>

      <GlassCard strong padding="none">
        <div className="flex flex-col gap-3 p-5 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Filtrar por status">
            {STATUSES.map(({ key, label }) => (
              <Link
                key={key}
                href={href({ status: key })}
                scroll={false}
                role="tab"
                aria-selected={status === key}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  status === key ? "bg-[var(--liquid-accent)] text-white shadow-sm" : "text-[var(--liquid-muted)] hover:bg-white/70",
                )}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form className="relative flex w-full gap-2 sm:w-auto" method="get">
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="range" value={range.key} />
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--liquid-muted)]" aria-hidden />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Escritor, descrição ou ID do gateway"
                aria-label="Buscar assinaturas"
                className="rounded-full border-white/60 bg-white/70 pl-9 sm:w-72"
              />
              <Button type="submit" variant="glass" className="rounded-full">Buscar</Button>
            </form>
            <ExportCsvButton
              label="CSV"
              filename={`planos-escritores-${data.end.slice(0, 10)}.csv`}
              headers={["Escritor", "Ciclo", "Valor (R$)", "Início", "Fim", "ID gateway"]}
              rows={data.subscriptions.map((sub) => [
                sub.writer?.name ?? "",
                CYCLE[sub.interval]?.name ?? sub.interval,
                (sub.amount / 100).toFixed(2).replace(".", ","),
                sub.startedAt.slice(0, 10),
                sub.endedAt?.slice(0, 10) ?? "",
                sub.asaasSubscriptionId ?? sub.stripeId ?? "",
              ])}
            />
          </div>
        </div>
        {q && (
          <p className="px-5 pb-3 text-xs text-[var(--liquid-muted)]">
            {INT.format(data.subscriptions.length)} resultado(s) para “{q}” ·{" "}
            <Link href={href({ q: "" })} className="font-medium text-[var(--liquid-accent)] hover:underline">
              limpar busca
            </Link>
          </p>
        )}
        <SubscriptionsTable subscriptions={data.subscriptions} />
        {data.subscriptions.length === 100 && (
          <p className="border-t border-black/5 px-5 py-3 text-xs text-[var(--liquid-muted)]">
            Mostrando as 100 mais recentes. Use a busca para encontrar uma assinatura específica.
          </p>
        )}
      </GlassCard>
    </section>
  );
}
