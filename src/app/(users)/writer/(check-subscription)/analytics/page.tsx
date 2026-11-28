import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { KpiStrip, PageHeader, RangeTabs, SectionLink, SectionTitle } from "@/components/ledger/Ledger";
import { rangeOf } from "@/components/ledger/ranges";
import { apiFetch } from "@/lib/api/server";
import { PublicationStatusBadge } from "@/components/writer/PublicationStatusBadge";
import { EngagementChart, NewSubscribersChart, RevenueChart, SERIES, type EngagementDay } from "./_charts/InsightCharts";
import { Meter } from "./_components/Meter";
import { BRL, DECIMAL, dayKey, daysBetween, deltaOf, INT, PCT, type Insights } from "./_lib/insights";

type Overview = {
  start: string;
  end: string;
  totalReaders: number;
  subsCount: number;
  revenueByDay: { day: string; revenue_cents: number; sales: number }[];
  topProducts: { id: string; title: string; revenue_cents: number; sales: number }[];
  newSubsByDay: { day: string; new_subs: number }[];
  statusDist: { status: string; count: number }[];
};

const STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativas", color: "#3f7d4f" },
  TRIALING: { label: "Em teste", color: "#2a6fa0" },
  PAST_DUE: { label: "Pagamento atrasado", color: "#c27c12" },
  PAUSED: { label: "Pausadas", color: "#a59d90" },
  CANCELED: { label: "Canceladas", color: "#b4412f" },
  UNPAID: { label: "Não pagas", color: "#8f4a8a" },
  INCOMPLETE: { label: "Incompletas", color: "#b99a52" },
  INCOMPLETE_EXPIRED: { label: "Expiradas", color: "#d3ccbf" },
};

const KIND_LABEL: Record<string, string> = { devotional: "Devocional", verse: "Versículo", quote: "Frase" };

export default async function WriterAnalyticsPage({ searchParams }: { searchParams?: Promise<{ range?: string }> }) {
  const range = rangeOf((await searchParams)?.range);
  const query = `range=${range.key}`;

  const [overviewResponse, insightsResponse] = await Promise.all([
    apiFetch<Overview>(`/writer/analytics?${query}`),
    apiFetch<Insights>(`/writer/analytics/insights?${query}`),
  ]);
  if (!overviewResponse.ok || !insightsResponse.ok) return notFound();
  const overview = overviewResponse.data;
  const insights = insightsResponse.data;
  const { current, previous } = insights;

  const days = daysBetween(overview.start, overview.end);
  const revenue = new Map(overview.revenueByDay.map((row) => [dayKey(row.day), row.revenue_cents / 100]));
  const subs = new Map(overview.newSubsByDay.map((row) => [dayKey(row.day), row.new_subs]));
  const engagement = new Map<string, EngagementDay>(
    days.map(({ key, label }) => [key, { label, devotional: 0, verse: 0, quote: 0 }]),
  );
  for (const { day, kind, count } of insights.engagementByDay) {
    const entry = engagement.get(dayKey(day));
    if (entry && (kind === "devotional" || kind === "verse" || kind === "quote")) entry[kind] = count;
  }

  const conversion = overview.totalReaders ? overview.subsCount / overview.totalReaders : 0;
  const averageTicket = current.sales ? current.netCents / current.sales / 100 : 0;
  const statusTotal = overview.statusDist.reduce((sum, { count }) => sum + count, 0);
  const statuses = [...overview.statusDist].sort((a, b) => b.count - a.count);
  const topContentMax = Math.max(1, ...insights.topContent.map(({ count }) => count));
  const readsPerReader = insights.engagedReaders ? current.completions / insights.engagedReaders : 0;

  return (
    <section className="w-full space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="Visão geral"
        description="Ganhos, crescimento e o que mais toca quem lê você."
        actions={<RangeTabs current={range.key} />}
      />

      <div className="grid gap-3">
        <KpiStrip
          items={[
            { label: "Receita líquida", value: BRL.format(current.netCents / 100), delta: deltaOf(current.netCents, previous.netCents) },
            { label: "Vendas", value: INT.format(current.sales), delta: deltaOf(current.sales, previous.sales), hint: `ticket ${BRL.format(averageTicket)}` },
            { label: "Novos assinantes", value: INT.format(current.newSubs), delta: deltaOf(current.newSubs, previous.newSubs) },
            { label: "Cancelamentos", value: INT.format(insights.canceledSubs), invert: true, hint: "no período" },
          ]}
        />
        <KpiStrip
          items={[
            { label: "Novos leitores", value: INT.format(current.newReaders), delta: deltaOf(current.newReaders, previous.newReaders) },
            {
              label: "Leitores ativos",
              value: INT.format(insights.activeReaders),
              hint: `de ${INT.format(overview.totalReaders)} no total`,
              href: "/writer/analytics/audience",
            },
            { label: "Leituras concluídas", value: INT.format(current.completions), delta: deltaOf(current.completions, previous.completions) },
            { label: "Leituras por leitor", value: DECIMAL.format(readsPerReader), hint: `${INT.format(insights.engagedReaders)} leram` },
            { label: "Conversão", value: PCT.format(conversion), hint: `${INT.format(overview.subsCount)} assinantes` },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <SectionTitle title="Receita por dia" description="Valores líquidos, já sem as taxas." />
          <RevenueChart data={days.map(({ key, label }) => ({ label, value: revenue.get(key) ?? 0 }))} />
        </GlassCard>

        <GlassCard>
          <SectionTitle
            title="Situação das assinaturas"
            description="Todas as assinaturas, de qualquer período."
            action={<SectionLink href="/writer/analytics/readers?filter=subs">Assinantes</SectionLink>}
          />
          {statuses.length === 0 ? (
            <p className="text-sm text-[var(--liquid-muted)]">Nenhuma assinatura ainda.</p>
          ) : (
            <ul className="grid gap-3">
              {statuses.map(({ status, count }) => (
                <Meter
                  key={status}
                  label={STATUS[status]?.label ?? status}
                  value={count}
                  max={statusTotal}
                  color={STATUS[status]?.color}
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <SectionTitle
            title="Leituras concluídas"
            description={`${INT.format(insights.engagedReaders)} ${insights.engagedReaders === 1 ? "leitor concluiu" : "leitores concluíram"} algum conteúdo diário no período.`}
            action={<SectionLink href="/writer/analytics/audience">Horários e constância</SectionLink>}
          />
          <EngagementChart data={[...engagement.values()]} />
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Novos assinantes" description="Assinaturas iniciadas por dia." />
          <NewSubscribersChart data={days.map(({ key, label }) => ({ label, value: subs.get(key) ?? 0 }))} />
        </GlassCard>

        <GlassCard className="lg:col-span-2" padding="none">
          <div className="p-5 pb-0">
            <SectionTitle
              title="Seus livros"
              description="Leitura e vendas no período. Abra um livro para ver até onde os leitores chegam."
              action={<SectionLink href="/writer/publications">Publicações</SectionLink>}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-y border-[var(--admin-line-soft)] text-left text-xs text-[var(--liquid-muted)]">
                  <th className="px-5 py-2 font-medium">Livro</th>
                  <th className="px-3 py-2 text-right font-medium">Capítulos</th>
                  <th className="px-3 py-2 text-right font-medium">Palavras</th>
                  <th className="px-3 py-2 text-right font-medium">Leram</th>
                  <th className="px-3 py-2 text-right font-medium">Concluíram</th>
                  <th className="px-3 py-2 text-right font-medium">Vendas</th>
                  <th className="px-5 py-2 text-right font-medium">Receita</th>
                </tr>
              </thead>
              <tbody>
                {insights.books.map((book) => (
                  <tr key={book.id} className="border-b border-[var(--admin-line-soft)] transition-colors last:border-0 hover:bg-[#faf8f4]">
                    <td className="px-5 py-2.5">
                      <Link
                        href={`/writer/analytics/books/${book.id}`}
                        className="inline-flex items-center gap-1 font-medium text-[var(--liquid-ink)] underline-offset-4 hover:underline"
                      >
                        {book.title}
                        <ChevronRight className="size-3.5 opacity-60" />
                      </Link>
                      <span className="ml-2 align-middle">
                        <PublicationStatusBadge status={book.status} />
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{INT.format(book.chapters)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{INT.format(book.words)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{INT.format(book.readers)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{INT.format(book.completed)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{INT.format(book.sales)}</td>
                    <td className="px-5 py-2.5 text-right font-medium tabular-nums">{BRL.format(book.revenue_cents / 100)}</td>
                  </tr>
                ))}
                {insights.books.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-[var(--liquid-muted)]">
                      Nenhum livro criado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Conteúdos mais concluídos" description="O que seus leitores terminaram de ler no período." />
          {insights.topContent.length === 0 ? (
            <p className="text-sm text-[var(--liquid-muted)]">Nenhuma conclusão no período.</p>
          ) : (
            <ol className="grid gap-3">
              {insights.topContent.map((item) => (
                <Meter
                  key={`${item.kind}:${item.id}`}
                  label={<span title={item.title}>{item.title}</span>}
                  hint={KIND_LABEL[item.kind] ?? item.kind}
                  value={item.count}
                  max={topContentMax}
                  color={SERIES[item.kind as keyof typeof SERIES]}
                />
              ))}
            </ol>
          )}
        </GlassCard>
      </div>
    </section>
  );
}
