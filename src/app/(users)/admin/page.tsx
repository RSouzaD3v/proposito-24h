// app/admin/page.tsx
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { apiFetch, apiGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { requireAdmin } from "./_lib/auth";
import { BRL, cents, deltaOf, formatDate, INT, PCT, rangeOf, SUBSCRIPTION_STATUS } from "./_lib/format";
import { CHART } from "./_lib/palette";
import { Delta, KpiStrip, PageHeader, RangeTabs, SectionLink, SectionTitle } from "./_components/StatTile";
import { OverviewRevenueChart, type RevenueDay } from "./_components/OverviewRevenueChart";
import { RecentSales, type RecentSale } from "./_components/RecentSales";
import { MetricsGuide } from "./_components/MetricsGuide";
import { ActivityFeed, type ActivityItem } from "./_components/ActivityFeed";

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
  const [data, activity] = await Promise.all([
    apiGet<Overview>(`/admin/overview?range=${range.key}`),
    apiFetch<ActivityItem[]>("/admin/activity"),
  ]);
  const { current, previous } = data;

  const firstName = (session.user.name ?? "").split(" ")[0];
  const statusTotal = data.statusDist.reduce((sum, { count }) => sum + count, 0);
  const pastDue = data.statusDist.find(({ status }) => status === "PAST_DUE")?.count ?? 0;
  const conversion = data.totalReaders ? data.subsActive / data.totalReaders : 0;
  const churn = data.subsActive ? current.canceledSubs / data.subsActive : 0;
  const activeShare = data.totalReaders ? data.activeReaders / data.totalReaders : 0;
  const takeRate = current.grossCents ? current.platformFeeCents / current.grossCents : 0;
  const attempts = current.sales + current.failedSales;
  const approval = attempts ? current.sales / attempts : 0;
  const topMax = Math.max(1, ...data.topWriters.map(({ revenue_cents }) => revenue_cents));
  const topShare = current.netCents
    ? data.topWriters.reduce((sum, { revenue_cents }) => sum + revenue_cents, 0) / current.netCents
    : 0;

  const alerts = [
    data.pendingPayouts.count > 0 && {
      href: "/admin/payouts",
      tone: "warn",
      text: `${INT.format(data.pendingPayouts.count)} ${data.pendingPayouts.count === 1 ? "repasse pendente" : "repasses pendentes"}`,
      detail: cents(data.pendingPayouts.netCents),
    },
    current.failedSales > 0 && {
      href: "/admin/billing",
      tone: "bad",
      text: `${INT.format(current.failedSales)} ${current.failedSales === 1 ? "pagamento falhou" : "pagamentos falharam"} no período`,
      detail: `aprovação de ${PCT.format(approval)}`,
    },
    pastDue > 0 && {
      href: "/admin/readers?filter=subscribers",
      tone: "warn",
      text: `${INT.format(pastDue)} ${pastDue === 1 ? "assinatura com pagamento atrasado" : "assinaturas com pagamento atrasado"}`,
      detail: "risco de cancelamento",
    },
  ].filter(Boolean) as { href: string; tone: "warn" | "bad"; text: string; detail: string }[];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        title="Visão geral"
        description={`${formatDate(data.start)} — ${formatDate(data.end)} · comparado ao período anterior de mesma duração`}
        actions={
          <>
            <RangeTabs current={range.key} />
            <MetricsGuide />
          </>
        }
      />

      {alerts.length > 0 && (
        <GlassCard padding="none" className="divide-y divide-[var(--admin-line-soft)]" role="status">
          {alerts.map((alert) => (
            <Link
              key={alert.text}
              href={alert.href}
              className="group flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[#faf8f4]"
            >
              <AlertTriangle
                className={cn("size-4 shrink-0", alert.tone === "bad" ? "text-[var(--admin-bad)]" : "text-[var(--admin-warn)]")}
                aria-hidden
              />
              <span className="font-medium text-[var(--liquid-ink)]">{alert.text}</span>
              <span className="hidden text-[var(--liquid-muted)] sm:inline">· {alert.detail}</span>
              <ArrowRight className="ml-auto size-4 text-[var(--liquid-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ))}
        </GlassCard>
      )}

      <KpiStrip
        items={[
          {
            label: "Receita líquida",
            value: cents(current.netCents),
            delta: deltaOf(current.netCents, previous.netCents),
            hint: "vs. período anterior",
          },
          {
            label: "Volume bruto (GMV)",
            value: cents(current.grossCents),
            delta: deltaOf(current.grossCents, previous.grossCents),
            hint: `${cents(current.feesCents)} em taxas`,
          },
          {
            label: "Vendas pagas",
            value: INT.format(current.sales),
            delta: deltaOf(current.sales, previous.sales),
            hint: `ticket médio ${cents(current.avgTicketCents)}`,
          },
          {
            label: "Comissão da plataforma",
            value: cents(current.platformFeeCents),
            delta: deltaOf(current.platformFeeCents, previous.platformFeeCents),
            hint: `take rate ${PCT.format(takeRate)}`,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <SectionTitle
            title="Receita no período"
            description={`${BRL.format(current.netCents / 100)} líquidos em ${INT.format(current.sales)} vendas`}
            action={<SectionLink href={`/admin/analytics?range=${range.key}`}>Relatório de receita</SectionLink>}
          />
          <OverviewRevenueChart data={data.revenueByDay} />
        </GlassCard>

        <GlassCard className="flex flex-col">
          <SectionTitle
            title="Assinaturas de leitores"
            description={`${INT.format(statusTotal)} no total`}
            action={<SectionLink href="/admin/readers?filter=subscribers">Assinantes</SectionLink>}
          />
          <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-4">
            <MiniStat label="Ativas" value={INT.format(data.subsActive)} />
            <MiniStat label="Conversão" value={PCT.format(conversion)} hint="dos leitores" />
            <MiniStat label="Novas" value={INT.format(current.newSubs)} delta={deltaOf(current.newSubs, previous.newSubs)} />
            <MiniStat label="Cancelamento" value={PCT.format(churn)} hint={`${INT.format(current.canceledSubs)} no período`} />
          </dl>

          {statusTotal > 0 ? (
            <div className="mt-auto">
              <div className="flex h-2 gap-[2px] overflow-hidden rounded-full" aria-hidden>
                {data.statusDist.map(({ status, count }) => (
                  <div
                    key={status}
                    style={{ width: `${(count / statusTotal) * 100}%`, background: SUBSCRIPTION_STATUS[status]?.color ?? CHART.neutral }}
                  />
                ))}
              </div>
              <ul className="mt-3 grid gap-1.5">
                {data.statusDist.map(({ status, count }) => (
                  <li key={status} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="flex items-center gap-2 text-[var(--liquid-ink)]">
                      <span
                        className="size-2 rounded-[2px]"
                        style={{ background: SUBSCRIPTION_STATUS[status]?.color ?? CHART.neutral }}
                        aria-hidden
                      />
                      {SUBSCRIPTION_STATUS[status]?.label ?? status}
                    </span>
                    <span className="tabular-nums text-[var(--liquid-muted)]">
                      <span className="font-medium text-[var(--liquid-ink)]">{INT.format(count)}</span> · {PCT.format(count / statusTotal)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-[var(--liquid-muted)]">Nenhuma assinatura ainda.</p>
          )}
        </GlassCard>
      </div>

      <KpiStrip
        items={[
          {
            label: "Novos leitores",
            value: INT.format(current.newReaders),
            delta: deltaOf(current.newReaders, previous.newReaders),
            hint: "cadastros",
            href: "/admin/readers",
          },
          {
            label: "Leitores ativos",
            value: INT.format(data.activeReaders),
            hint: `${PCT.format(activeShare)} de ${INT.format(data.totalReaders)}`,
            href: `/admin/engagement?range=${range.key}`,
          },
          {
            label: "Cancelamentos",
            value: INT.format(current.canceledSubs),
            delta: deltaOf(current.canceledSubs, previous.canceledSubs),
            invert: true,
            hint: "assinaturas",
          },
          {
            label: "Novos escritores",
            value: INT.format(current.newWriters),
            delta: deltaOf(current.newWriters, previous.newWriters),
            hint: `${INT.format(data.totalWriters)} no total`,
            href: "/admin/writers",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <GlassCard className="lg:col-span-2">
          <SectionTitle
            title="Escritores que mais venderam"
            description={
              data.topWriters.length ? `${PCT.format(Math.min(topShare, 1))} da receita do período` : "Por receita líquida no período"
            }
            action={<SectionLink href="/admin/writers">Todos</SectionLink>}
          />
          {data.topWriters.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--liquid-muted)]">Nenhuma venda no período.</p>
          )}
          <ol className="grid gap-0.5">
            {data.topWriters.map((writer, index) => (
              <li key={writer.writer_id}>
                <Link
                  href={`/admin/writer/${writer.writer_id}`}
                  className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-[#faf8f4]"
                >
                  <span className="w-4 shrink-0 text-right text-xs tabular-nums text-[var(--liquid-muted)]">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[13.5px] font-medium text-[var(--liquid-ink)] group-hover:underline group-hover:underline-offset-4">
                        {writer.writer_name}
                      </span>
                      <span className="shrink-0 text-[13.5px] font-medium tabular-nums text-[var(--liquid-ink)]">
                        {cents(writer.revenue_cents)}
                      </span>
                    </span>
                    <span className="mt-1.5 flex items-center gap-3">
                      <span className="h-1 flex-1 rounded-full bg-[var(--admin-sunken)]">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${(writer.revenue_cents / topMax) * 100}%`, background: CHART.primary }}
                        />
                      </span>
                      <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-[var(--liquid-muted)]">
                        {INT.format(writer.sales)} {writer.sales === 1 ? "venda" : "vendas"}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </GlassCard>

        <GlassCard className="lg:col-span-3">
          <SectionTitle
            title="Vendas recentes"
            description="Clique em uma venda para ver os detalhes"
            action={<SectionLink href="/admin/billing">Pagamentos</SectionLink>}
          />
          <RecentSales sales={data.recentSales} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <GlassCard className="lg:col-span-3">
          <SectionTitle
            title="Atividade recente"
            description="Cadastros, vendas, assinaturas e leituras concluídas"
            action={<SectionLink href={`/admin/engagement?range=${range.key}`}>Engajamento</SectionLink>}
          />
          {activity.ok ? (
            <ActivityFeed items={activity.data} />
          ) : (
            <p className="py-6 text-center text-sm text-[var(--liquid-muted)]">Não foi possível carregar a atividade agora.</p>
          )}
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <SectionTitle title="Plataforma" description="Totais acumulados" />
          <dl className="divide-y divide-[var(--admin-line-soft)] text-[13.5px]">
            <LedgerRow label="Escritores" value={INT.format(data.totalWriters)} hint={`${INT.format(current.newWriters)} novos`} href="/admin/writers" />
            <LedgerRow label="Leitores" value={INT.format(data.totalReaders)} hint={`${INT.format(current.newReaders)} novos`} href="/admin/readers" />
            <LedgerRow
              label="Publicações"
              value={INT.format(data.totalPublications)}
              hint={`${INT.format(data.publishedPublications)} publicadas`}
            />
            <LedgerRow
              label="MRR dos escritores"
              value={cents(data.writerPlans.mrrCents)}
              hint={`${INT.format(data.writerPlans.active)} ${data.writerPlans.active === 1 ? "plano" : "planos"}`}
              href="/admin/writer-subscriptions"
            />
            <LedgerRow
              label="Repasses pendentes"
              value={cents(data.pendingPayouts.netCents)}
              hint={`${INT.format(data.pendingPayouts.count)} ${data.pendingPayouts.count === 1 ? "registro" : "registros"}`}
              href="/admin/payouts"
              emphasis={data.pendingPayouts.count > 0}
            />
          </dl>
        </GlassCard>
      </div>
    </section>
  );
}

function LedgerRow({
  label,
  value,
  hint,
  href,
  emphasis,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  emphasis?: boolean;
}) {
  const inner = (
    <>
      <dt className="text-[var(--liquid-muted)]">
        {label}
        {hint && <span className="ml-1.5 text-xs opacity-80">· {hint}</span>}
      </dt>
      <dd className={cn("font-medium tabular-nums", emphasis ? "text-[var(--admin-warn)]" : "text-[var(--liquid-ink)]")}>{value}</dd>
    </>
  );
  return href ? (
    <Link href={href} className="-mx-2 flex items-baseline justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-[#faf8f4]">
      {inner}
    </Link>
  ) : (
    <div className="flex items-baseline justify-between gap-3 py-2.5">{inner}</div>
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
    <div>
      <dt className="text-xs text-[var(--liquid-muted)]">{label}</dt>
      <dd className="mt-0.5 flex items-baseline gap-2 text-xl font-semibold tabular-nums tracking-tight text-[var(--liquid-ink)]">
        {value}
        {delta !== undefined && <Delta value={delta} />}
      </dd>
      {hint && <dd className="truncate text-[11px] text-[var(--liquid-muted)]">{hint}</dd>}
    </div>
  );
}
