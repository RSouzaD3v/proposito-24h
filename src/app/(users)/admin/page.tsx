// app/admin/page.tsx
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  BookOpen,
  CircleDollarSign,
  CreditCard,
  Percent,
  Receipt,
  ShoppingBag,
  UserMinus,
  UserPlus,
  Users2,
  Activity,
  Repeat,
} from "lucide-react";
import { apiGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { requireAdmin } from "./_lib/auth";
import { BRL, cents, deltaOf, formatDate, INT, PCT, RANGES, rangeOf, SUBSCRIPTION_STATUS } from "./_lib/format";
import { SectionTitle, StatTile } from "./_components/StatTile";
import { OverviewRevenueChart, type RevenueDay } from "./_components/OverviewRevenueChart";
import { RecentSales, type RecentSale } from "./_components/RecentSales";
import { MetricsGuide } from "./_components/MetricsGuide";

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

type Overview = {
  start: string;
  end: string;
  totalWriters: number;
  totalReaders: number;
  totalPublications: number;
  publishedPublications: number;
  subsActive: number;
  activeReaders: number;
  current: PeriodTotals;
  previous: PeriodTotals;
  revenueByDay: RevenueDay[];
  topWriters: { writer_id: string; writer_name: string; revenue_cents: number; sales: number }[];
  recentSales: RecentSale[];
  statusDist: { status: string; count: number }[];
  pendingPayouts: { count: number; netCents: number };
  writerPlans: { active: number; mrrCents: number };
};

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()),
  );
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function AdminHome({ searchParams }: { searchParams?: Promise<{ range?: string }> }) {
  const { session } = await requireAdmin();
  const range = rangeOf((await searchParams)?.range);
  const data = await apiGet<Overview>(`/admin/overview?range=${range.key}`);
  const { current, previous } = data;

  const firstName = (session.user.name ?? "").split(" ")[0];
  const statusTotal = data.statusDist.reduce((sum, { count }) => sum + count, 0);
  const pastDue = data.statusDist.find(({ status }) => status === "PAST_DUE")?.count ?? 0;
  const conversion = data.totalReaders ? data.subsActive / data.totalReaders : 0;
  const churn = data.subsActive ? current.canceledSubs / data.subsActive : 0;
  const activeShare = data.totalReaders ? data.activeReaders / data.totalReaders : 0;
  const takeRate = current.grossCents ? current.platformFeeCents / current.grossCents : 0;
  const topMax = Math.max(1, ...data.topWriters.map(({ revenue_cents }) => revenue_cents));
  const topShare = current.netCents
    ? data.topWriters.reduce((sum, { revenue_cents }) => sum + revenue_cents, 0) / current.netCents
    : 0;

  const alerts = [
    data.pendingPayouts.count > 0 && {
      href: "/admin/payouts",
      tone: "amber",
      text: `${INT.format(data.pendingPayouts.count)} ${data.pendingPayouts.count === 1 ? "repasse pendente" : "repasses pendentes"} · ${cents(data.pendingPayouts.netCents)}`,
    },
    current.failedSales > 0 && {
      href: "/admin/billing",
      tone: "red",
      text: `${INT.format(current.failedSales)} ${current.failedSales === 1 ? "pagamento falhou" : "pagamentos falharam"} no período`,
    },
    pastDue > 0 && {
      href: "/admin/analytics",
      tone: "amber",
      text: `${INT.format(pastDue)} ${pastDue === 1 ? "assinatura com pagamento atrasado" : "assinaturas com pagamento atrasado"}`,
    },
  ].filter(Boolean) as { href: string; tone: "amber" | "red"; text: string }[];

  return (
    <section className="space-y-6">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 animate-glass-in lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--liquid-accent)]">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Visão geral</h1>
          <p className="text-sm text-[var(--liquid-muted)]">
            {formatDate(data.start)} — {formatDate(data.end)} · comparado ao período anterior de mesma duração
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
          <MetricsGuide />
        </div>
      </header>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-glass-in" role="status">
          {alerts.map((alert) => (
            <Link
              key={alert.text}
              href={alert.href}
              className={cn(
                "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-xl transition-colors",
                alert.tone === "red"
                  ? "border-red-200/70 bg-red-50/80 text-red-800 hover:bg-red-50"
                  : "border-amber-200/70 bg-amber-50/80 text-amber-900 hover:bg-amber-50",
              )}
            >
              <AlertTriangle className="size-4" aria-hidden />
              {alert.text}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ))}
        </div>
      )}

      {/* Finanças */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          size="lg"
          label="Receita líquida"
          value={cents(current.netCents)}
          icon={CircleDollarSign}
          tone="blue"
          delta={deltaOf(current.netCents, previous.netCents)}
        />
        <StatTile
          size="lg"
          label="Volume bruto (GMV)"
          value={cents(current.grossCents)}
          icon={Receipt}
          tone="violet"
          delta={deltaOf(current.grossCents, previous.grossCents)}
          hint={`${cents(current.feesCents)} em taxas`}
        />
        <StatTile
          size="lg"
          label="Vendas pagas"
          value={INT.format(current.sales)}
          icon={ShoppingBag}
          tone="green"
          delta={deltaOf(current.sales, previous.sales)}
          hint={`ticket ${cents(current.avgTicketCents)}`}
        />
        <StatTile
          size="lg"
          label="Comissão da plataforma"
          value={cents(current.platformFeeCents)}
          icon={Percent}
          tone="orange"
          delta={deltaOf(current.platformFeeCents, previous.platformFeeCents)}
          hint={`take rate ${PCT.format(takeRate)}`}
        />
      </div>

      {/* Gráfico + saúde das assinaturas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard strong className="lg:col-span-2">
          <SectionTitle
            title="Receita ao longo do período"
            description={`${BRL.format(current.netCents / 100)} líquidos em ${INT.format(current.sales)} vendas`}
            action={
              <Link href={`/admin/analytics?range=${range.key}`} className="shrink-0 text-xs font-medium text-[var(--liquid-accent)] hover:underline">
                Analytics completo
              </Link>
            }
          />
          <OverviewRevenueChart data={data.revenueByDay} />
        </GlassCard>

        <GlassCard strong className="flex flex-col">
          <SectionTitle title="Assinaturas de leitores" description={`${INT.format(statusTotal)} no total`} />
          <div className="mb-4 grid grid-cols-2 gap-2">
            <MiniStat label="Ativas" value={INT.format(data.subsActive)} />
            <MiniStat label="Conversão" value={PCT.format(conversion)} hint="leitores assinantes" />
            <MiniStat
              label="Novas"
              value={INT.format(current.newSubs)}
              delta={deltaOf(current.newSubs, previous.newSubs)}
            />
            <MiniStat label="Cancelamento" value={PCT.format(churn)} hint={`${INT.format(current.canceledSubs)} no período`} />
          </div>

          {statusTotal > 0 ? (
            <>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-black/5" aria-hidden>
                {data.statusDist.map(({ status, count }) => (
                  <div
                    key={status}
                    style={{ width: `${(count / statusTotal) * 100}%`, background: SUBSCRIPTION_STATUS[status]?.color ?? "#a3a3a3" }}
                  />
                ))}
              </div>
              <ul className="mt-3 grid gap-1.5">
                {data.statusDist.map(({ status, count }) => (
                  <li key={status} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-[var(--liquid-ink)]">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: SUBSCRIPTION_STATUS[status]?.color ?? "#a3a3a3" }}
                        aria-hidden
                      />
                      {SUBSCRIPTION_STATUS[status]?.label ?? status}
                    </span>
                    <span className="tabular-nums text-[var(--liquid-muted)]">
                      <span className="font-semibold text-[var(--liquid-ink)]">{INT.format(count)}</span> ·{" "}
                      {PCT.format(count / statusTotal)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-[var(--liquid-muted)]">Nenhuma assinatura ainda.</p>
          )}
        </GlassCard>
      </div>

      {/* Audiência */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile
          label="Novos leitores"
          value={INT.format(current.newReaders)}
          icon={UserPlus}
          tone="blue"
          delta={deltaOf(current.newReaders, previous.newReaders)}
        />
        <StatTile
          label="Leitores ativos"
          value={INT.format(data.activeReaders)}
          icon={Activity}
          tone="green"
          hint={`${PCT.format(activeShare)} de ${INT.format(data.totalReaders)} leitores`}
        />
        <StatTile
          label="Cancelamentos"
          value={INT.format(current.canceledSubs)}
          icon={UserMinus}
          tone="rose"
          invert
          delta={deltaOf(current.canceledSubs, previous.canceledSubs)}
        />
        <StatTile
          label="Novos escritores"
          value={INT.format(current.newWriters)}
          icon={Users2}
          tone="violet"
          delta={deltaOf(current.newWriters, previous.newWriters)}
          href="/admin/writers"
        />
      </div>

      {/* Top escritores + vendas recentes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <GlassCard strong className="lg:col-span-2">
          <SectionTitle
            title="Top escritores"
            description={
              data.topWriters.length
                ? `${PCT.format(Math.min(topShare, 1))} da receita do período`
                : "Por receita líquida no período"
            }
            action={
              <Link href="/admin/writers" className="shrink-0 text-xs font-medium text-[var(--liquid-accent)] hover:underline">
                Ver todos
              </Link>
            }
          />
          {data.topWriters.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--liquid-muted)]">Nenhuma venda no período.</p>
          )}
          <ol className="grid gap-1">
            {data.topWriters.map((writer, index) => (
              <li key={writer.writer_id}>
                <Link
                  href={`/admin/writer/${writer.writer_id}`}
                  className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/60"
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      index === 0 ? "bg-amber-100 text-amber-800" : "bg-black/5 text-[var(--liquid-muted)]",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium text-[var(--liquid-ink)] group-hover:underline">
                        {writer.writer_name}
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--liquid-ink)]">
                        {cents(writer.revenue_cents)}
                      </span>
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="h-1.5 flex-1 rounded-full bg-black/5">
                        <span
                          className="block h-full rounded-full bg-[#2a78d6]"
                          style={{ width: `${(writer.revenue_cents / topMax) * 100}%` }}
                        />
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-[var(--liquid-muted)]">
                        {INT.format(writer.sales)} {writer.sales === 1 ? "venda" : "vendas"}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </GlassCard>

        <GlassCard strong className="lg:col-span-3">
          <SectionTitle
            title="Vendas recentes"
            description="Toque em uma venda para ver os detalhes"
            action={
              <Link href="/admin/billing" className="shrink-0 text-xs font-medium text-[var(--liquid-accent)] hover:underline">
                Pagamentos
              </Link>
            }
          />
          <RecentSales sales={data.recentSales} />
        </GlassCard>
      </div>

      {/* Plataforma */}
      <div>
        <SectionTitle title="Plataforma" description="Totais acumulados e pendências" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatTile
            label="Escritores"
            value={INT.format(data.totalWriters)}
            icon={Users2}
            tone="slate"
            hint={`${INT.format(current.newWriters)} novos no período`}
            href="/admin/writers"
          />
          <StatTile
            label="Publicações"
            value={INT.format(data.totalPublications)}
            icon={BookOpen}
            tone="slate"
            hint={`${INT.format(data.publishedPublications)} publicadas`}
            href="/admin/analytics"
          />
          <StatTile
            label="MRR dos escritores"
            value={cents(data.writerPlans.mrrCents)}
            icon={Repeat}
            tone="slate"
            hint={`${INT.format(data.writerPlans.active)} ${data.writerPlans.active === 1 ? "plano ativo" : "planos ativos"}`}
            href="/admin/writer-subscriptions"
          />
          <StatTile
            label="Repasses pendentes"
            value={cents(data.pendingPayouts.netCents)}
            icon={data.pendingPayouts.count ? Banknote : CreditCard}
            tone={data.pendingPayouts.count ? "orange" : "slate"}
            hint={`${INT.format(data.pendingPayouts.count)} ${data.pendingPayouts.count === 1 ? "registro" : "registros"}`}
            href="/admin/payouts"
          />
        </div>
      </div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: number | "new" | null;
}) {
  return (
    <div className="rounded-xl bg-white/55 px-3 py-2">
      <p className="text-xs text-[var(--liquid-muted)]">{label}</p>
      <p className="flex items-baseline gap-1.5 text-lg font-bold tabular-nums text-[var(--liquid-ink)]">
        {value}
        {typeof delta === "number" && delta !== 0 && (
          <span className={cn("text-xs font-semibold", delta > 0 ? "text-emerald-700" : "text-red-700")}>
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </p>
      {hint && <p className="truncate text-[11px] text-[var(--liquid-muted)]">{hint}</p>}
    </div>
  );
}
