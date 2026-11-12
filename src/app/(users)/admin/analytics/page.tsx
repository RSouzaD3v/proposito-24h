// app/admin/analytics/page.tsx
import Link from "next/link";
import {
  CircleDollarSign,
  Percent,
  Receipt,
  ShoppingBag,
  UserMinus,
  UserPlus,
  Users2,
  XCircle,
} from "lucide-react";
import { apiGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { requireAdmin } from "../_lib/auth";
import { cents, deltaOf, formatDate, INT, PCT, RANGES, rangeOf, SUBSCRIPTION_STATUS } from "../_lib/format";
import { SectionTitle, StatTile } from "../_components/StatTile";
import { OverviewRevenueChart, type RevenueDay } from "../_components/OverviewRevenueChart";
import { MetricsGuide } from "../_components/MetricsGuide";
import { ExportCsvButton } from "../_components/ExportCsvButton";
import { GrowthChart, StatusDonut, type GrowthMonth } from "./_charts/AnalyticsCharts";
import { TopWritersTable, type TopWriter } from "./_components/TopWritersTable";

type PeriodTotals = {
  grossCents: number;
  feesCents: number;
  netCents: number;
  platformFeeCents: number;
  sales: number;
  avgTicketCents: number;
  failedSales: number;
  newReaders: number;
  newWriters: number;
  newSubs: number;
  canceledSubs: number;
};

type Analytics = {
  start: string;
  end: string;
  current: PeriodTotals;
  previous: PeriodTotals;
  revenueByDay: RevenueDay[];
  topWriters: TopWriter[];
  topPublications: { id: string; title: string; writer_id: string; writer_name: string; revenue_cents: number; sales: number }[];
  providerSplit: { provider: string; sales: number; gross_cents: number; revenue_cents: number }[];
  statusDist: { status: string; count: number }[];
  growthByMonth: GrowthMonth[];
};

const PROVIDER = {
  ASAAS: { label: "Asaas", color: "#2a78d6" },
  STRIPE: { label: "Stripe", color: "#7c5cd6" },
} as Record<string, { label: string; color: string }>;

const money = (valueCents: number) => (valueCents / 100).toFixed(2).replace(".", ",");

export default async function AdminAnalytics({ searchParams }: { searchParams?: Promise<{ range?: string }> }) {
  await requireAdmin();
  const range = rangeOf((await searchParams)?.range);
  const data = await apiGet<Analytics>(`/admin/analytics?range=${range.key}`);
  const { current, previous } = data;

  const attempts = current.sales + current.failedSales;
  const successRate = attempts ? current.sales / attempts : 0;
  const previousAttempts = previous.sales + previous.failedSales;
  const takeRate = current.grossCents ? current.platformFeeCents / current.grossCents : 0;
  const bestDay = data.revenueByDay.reduce<RevenueDay | null>(
    (best, day) => (day.revenue_cents > (best?.revenue_cents ?? 0) ? day : best),
    null,
  );
  const activeDays = data.revenueByDay.filter((day) => day.sales > 0).length;
  const dailyAverage = data.revenueByDay.length ? current.netCents / data.revenueByDay.length : 0;
  const providerTotal = data.providerSplit.reduce((sum, row) => sum + row.revenue_cents, 0);
  const publicationMax = Math.max(1, ...data.topPublications.map(({ revenue_cents }) => revenue_cents));
  const statusSlices = data.statusDist.map(({ status, count }) => ({
    key: status,
    count,
    label: SUBSCRIPTION_STATUS[status]?.label ?? status,
    color: SUBSCRIPTION_STATUS[status]?.color ?? "#a3a3a3",
  }));
  const statusTotal = statusSlices.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 animate-glass-in lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Analytics</h1>
          <p className="text-sm text-[var(--liquid-muted)]">
            {formatDate(data.start)} — {formatDate(data.end)} · vendas, assinaturas e crescimento da plataforma
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Período" className="glass-surface flex w-fit gap-0.5 rounded-full p-1">
            {RANGES.map(({ key, label }) => (
              <Link
                key={key}
                href={`?range=${key}`}
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
          <ExportCsvButton
            filename={`analytics-${range.key}-${data.end.slice(0, 10)}.csv`}
            headers={["Dia", "Receita líquida (R$)", "Vendas", "Receita período anterior (R$)"]}
            rows={data.revenueByDay.map((day) => [day.day, money(day.revenue_cents), day.sales, money(day.previous_revenue_cents)])}
          />
          <MetricsGuide />
        </div>
      </header>

      {/* Vendas */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile size="lg" label="Receita líquida" value={cents(current.netCents)} icon={CircleDollarSign} tone="blue" delta={deltaOf(current.netCents, previous.netCents)} />
        <StatTile size="lg" label="Volume bruto (GMV)" value={cents(current.grossCents)} icon={Receipt} tone="violet" delta={deltaOf(current.grossCents, previous.grossCents)} />
        <StatTile size="lg" label="Ticket médio" value={cents(current.avgTicketCents)} icon={ShoppingBag} tone="green" delta={deltaOf(current.avgTicketCents, previous.avgTicketCents)} hint={`${INT.format(current.sales)} vendas`} />
        <StatTile size="lg" label="Comissão da plataforma" value={cents(current.platformFeeCents)} icon={Percent} tone="orange" delta={deltaOf(current.platformFeeCents, previous.platformFeeCents)} hint={`take rate ${PCT.format(takeRate)}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard strong className="lg:col-span-2">
          <SectionTitle title="Receita por dia" description="Valores líquidos, comparados dia a dia com o período anterior" />
          <OverviewRevenueChart data={data.revenueByDay} />
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/5 pt-4 text-center">
            <Mini label="Média diária" value={cents(dailyAverage)} />
            <Mini label="Melhor dia" value={bestDay ? cents(bestDay.revenue_cents) : "—"} hint={bestDay ? `${bestDay.day.slice(8, 10)}/${bestDay.day.slice(5, 7)}` : undefined} />
            <Mini label="Dias com venda" value={`${INT.format(activeDays)} de ${INT.format(data.revenueByDay.length)}`} />
          </div>
        </GlassCard>

        <GlassCard strong className="flex flex-col gap-5">
          <div>
            <SectionTitle title="Saúde dos pagamentos" description="Tentativas de compra no período" />
            <div className="flex items-end justify-between gap-3">
              <p className="text-3xl font-bold tabular-nums text-[var(--liquid-ink)]">{PCT.format(successRate)}</p>
              <p className="pb-1 text-xs text-[var(--liquid-muted)]">
                anterior {previousAttempts ? PCT.format(previous.sales / previousAttempts) : "—"}
              </p>
            </div>
            <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-black/5" aria-hidden>
              <div className="bg-[#1baf7a]" style={{ width: `${successRate * 100}%` }} />
              <div className="bg-[#d64545]" style={{ width: `${attempts ? (current.failedSales / attempts) * 100 : 0}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-[var(--liquid-muted)]">
              <span>{INT.format(current.sales)} pagas</span>
              <span>{INT.format(current.failedSales)} falharam</span>
            </div>
          </div>

          <div>
            <SectionTitle title="Por gateway" description="Receita líquida no período" />
            {data.providerSplit.length === 0 && <p className="text-sm text-[var(--liquid-muted)]">Nenhuma venda no período.</p>}
            <ul className="grid gap-3">
              {data.providerSplit.map((row) => {
                const meta = PROVIDER[row.provider] ?? { label: row.provider, color: "#8a94a6" };
                return (
                  <li key={row.provider}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 font-medium text-[var(--liquid-ink)]">
                        <span className="size-2.5 rounded-full" style={{ background: meta.color }} aria-hidden />
                        {meta.label}
                      </span>
                      <span className="tabular-nums text-[var(--liquid-muted)]">
                        <span className="font-semibold text-[var(--liquid-ink)]">{cents(row.revenue_cents)}</span> · {INT.format(row.sales)} vendas
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-black/5">
                      <div className="h-full rounded-full" style={{ width: `${providerTotal ? (row.revenue_cents / providerTotal) * 100 : 0}%`, background: meta.color }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </GlassCard>
      </div>

      {/* Escritores e publicações */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <GlassCard strong padding="none" className="lg:col-span-3">
          <div className="p-5 pb-2">
            <SectionTitle
              title="Ranking de escritores"
              description="Top 10 por receita líquida · toque para ver o detalhamento"
              action={
                <ExportCsvButton
                  label="CSV"
                  filename={`escritores-${range.key}-${data.end.slice(0, 10)}.csv`}
                  headers={["Escritor", "Vendas", "Bruto (R$)", "Comissão (R$)", "Líquido (R$)"]}
                  rows={data.topWriters.map((w) => [w.writer_name, w.sales, money(w.gross_cents), money(w.platform_fee_cents), money(w.revenue_cents)])}
                />
              }
            />
          </div>
          <TopWritersTable writers={data.topWriters} totalNetCents={current.netCents} />
        </GlassCard>

        <GlassCard strong className="lg:col-span-2">
          <SectionTitle title="Publicações mais vendidas" description="Por receita líquida no período" />
          {data.topPublications.length === 0 && (
            <p className="py-10 text-center text-sm text-[var(--liquid-muted)]">Nenhuma venda no período.</p>
          )}
          <ol className="grid gap-3">
            {data.topPublications.map((publication, index) => (
              <li key={publication.id}>
                <div className="flex items-start justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-[var(--liquid-ink)]" title={publication.title}>
                      <span className="mr-1.5 tabular-nums text-[var(--liquid-muted)]">{index + 1}.</span>
                      {publication.title}
                    </span>
                    <Link href={`/admin/writer/${publication.writer_id}`} className="block truncate text-xs text-[var(--liquid-muted)] hover:underline">
                      {publication.writer_name} · {INT.format(publication.sales)} {publication.sales === 1 ? "venda" : "vendas"}
                    </Link>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-[var(--liquid-ink)]">{cents(publication.revenue_cents)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-black/5">
                  <div className="h-full rounded-full bg-[#eb6834]" style={{ width: `${(publication.revenue_cents / publicationMax) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>

      {/* Audiência e assinaturas */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Novos leitores" value={INT.format(current.newReaders)} icon={UserPlus} tone="blue" delta={deltaOf(current.newReaders, previous.newReaders)} />
        <StatTile label="Novas assinaturas" value={INT.format(current.newSubs)} icon={Users2} tone="green" delta={deltaOf(current.newSubs, previous.newSubs)} />
        <StatTile label="Cancelamentos" value={INT.format(current.canceledSubs)} icon={UserMinus} tone="rose" invert delta={deltaOf(current.canceledSubs, previous.canceledSubs)} />
        <StatTile label="Pagamentos falhos" value={INT.format(current.failedSales)} icon={XCircle} tone="orange" invert delta={deltaOf(current.failedSales, previous.failedSales)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard strong className="lg:col-span-2">
          <SectionTitle title="Crescimento mensal" description="Últimos 12 meses, independente do período selecionado" />
          <GrowthChart data={data.growthByMonth} />
        </GlassCard>

        <GlassCard strong>
          <SectionTitle title="Assinaturas por status" description="Todas as assinaturas de leitores" />
          <StatusDonut data={statusSlices} />
          <ul className="mt-3 grid gap-1.5">
            {statusSlices.map((slice) => (
              <li key={slice.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-[var(--liquid-ink)]">
                  <span className="size-2.5 rounded-full" style={{ background: slice.color }} aria-hidden />
                  {slice.label}
                </span>
                <span className="tabular-nums text-[var(--liquid-muted)]">
                  <span className="font-semibold text-[var(--liquid-ink)]">{INT.format(slice.count)}</span> · {PCT.format(statusTotal ? slice.count / statusTotal : 0)}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </section>
  );
}

function Mini({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-[var(--liquid-muted)]">{label}</p>
      <p className="truncate font-semibold tabular-nums text-[var(--liquid-ink)]">{value}</p>
      {hint && <p className="text-[11px] text-[var(--liquid-muted)]">{hint}</p>}
    </div>
  );
}
