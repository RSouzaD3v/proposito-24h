import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { apiFetch } from "@/lib/api/server";
import { cn } from "@/lib/utils";
import { KpiTile } from "@/components/writer/KpiTile";
import { PublicationStatusBadge } from "@/components/writer/PublicationStatusBadge";
import { EngagementChart, NewSubscribersChart, RevenueChart, type EngagementDay } from "./_charts/InsightCharts";
import { BRL, dayKey, daysBetween, deltaOf, INT, type Insights } from "./_lib/insights";

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

const RANGES = [
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "365d", label: "1 ano" },
];

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativas",
  TRIALING: "Em teste",
  PAST_DUE: "Pagamento atrasado",
  PAUSED: "Pausadas",
  CANCELED: "Canceladas",
  UNPAID: "Não pagas",
  INCOMPLETE: "Incompletas",
  INCOMPLETE_EXPIRED: "Expiradas",
};

const KIND_LABEL: Record<string, string> = { devotional: "Devocional", verse: "Versículo", quote: "Frase" };

export default async function WriterAnalyticsPage({ searchParams }: { searchParams?: Promise<{ range?: string }> }) {
  const requested = (await searchParams)?.range ?? "30d";
  const range = RANGES.some(({ key }) => key === requested) ? requested : "30d";
  const query = `range=${encodeURIComponent(range)}`;

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

  const conversion = overview.totalReaders ? (overview.subsCount / overview.totalReaders) * 100 : 0;
  const averageTicket = current.sales ? current.netCents / current.sales / 100 : 0;
  const statusTotal = overview.statusDist.reduce((sum, { count }) => sum + count, 0);
  const statuses = [...overview.statusDist].sort((a, b) => b.count - a.count);
  const topContentMax = Math.max(1, ...insights.topContent.map(({ count }) => count));

  return (
    <section className="w-full space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Meus insights</h1>
          <p className="text-sm text-[var(--liquid-muted)]">Ganhos, leitores e o que mais toca quem lê você.</p>
        </div>
        <nav aria-label="Período" className="glass-surface flex w-fit gap-0.5 rounded-full p-1">
          {RANGES.map(({ key, label }) => (
            <Link
              key={key}
              href={`?range=${key}`}
              aria-current={key === range ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                key === range ? "bg-[var(--liquid-accent)] text-white" : "text-[var(--liquid-muted)] hover:bg-white/70",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Receita líquida" value={BRL.format(current.netCents / 100)} delta={deltaOf(current.netCents, previous.netCents)} />
        <KpiTile label="Vendas" value={INT.format(current.sales)} delta={deltaOf(current.sales, previous.sales)} />
        <KpiTile label="Novos assinantes" value={INT.format(current.newSubs)} delta={deltaOf(current.newSubs, previous.newSubs)} />
        <KpiTile label="Novos leitores" value={INT.format(current.newReaders)} delta={deltaOf(current.newReaders, previous.newReaders)} />
        <KpiTile label="Leitores ativos" value={INT.format(insights.activeReaders)} hint={`de ${INT.format(overview.totalReaders)} no total`} />
        <KpiTile label="Leituras concluídas" value={INT.format(current.completions)} delta={deltaOf(current.completions, previous.completions)} />
        <KpiTile label="Conversão em assinatura" value={`${conversion.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`} hint={`${INT.format(overview.subsCount)} de ${INT.format(overview.totalReaders)} leitores`} />
        <KpiTile label="Cancelamentos" value={INT.format(insights.canceledSubs)} hint={`Ticket médio ${BRL.format(averageTicket)}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard strong className="lg:col-span-2">
          <h2 className="font-semibold text-[var(--liquid-ink)]">Receita por dia</h2>
          <p className="mb-3 text-xs text-[var(--liquid-muted)]">Valores líquidos, já sem as taxas.</p>
          <RevenueChart data={days.map(({ key, label }) => ({ label, value: revenue.get(key) ?? 0 }))} />
        </GlassCard>

        <GlassCard strong>
          <h2 className="mb-3 font-semibold text-[var(--liquid-ink)]">Situação das assinaturas</h2>
          {statuses.length === 0 && <p className="text-sm text-[var(--liquid-muted)]">Nenhuma assinatura ainda.</p>}
          <ul className="space-y-3">
            {statuses.map(({ status, count }) => (
              <li key={status}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-[var(--liquid-ink)]">{STATUS_LABEL[status] ?? status}</span>
                  <span className="font-semibold tabular-nums text-[var(--liquid-ink)]">{INT.format(count)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-black/5">
                  <div className="h-full rounded-full bg-[#2a78d6]" style={{ width: `${(count / statusTotal) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard strong className="lg:col-span-2">
          <h2 className="font-semibold text-[var(--liquid-ink)]">Leituras concluídas</h2>
          <p className="mb-3 text-xs text-[var(--liquid-muted)]">
            {INT.format(insights.engagedReaders)} {insights.engagedReaders === 1 ? "leitor concluiu" : "leitores concluíram"} algum conteúdo diário no período.
          </p>
          <EngagementChart data={[...engagement.values()]} />
        </GlassCard>

        <GlassCard strong>
          <h2 className="mb-3 font-semibold text-[var(--liquid-ink)]">Novos assinantes</h2>
          <NewSubscribersChart data={days.map(({ key, label }) => ({ label, value: subs.get(key) ?? 0 }))} />
        </GlassCard>

        <GlassCard strong className="lg:col-span-2" padding="none">
          <h2 className="p-5 pb-3 font-semibold text-[var(--liquid-ink)]">Seus livros</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-y border-black/5 text-left text-xs text-[var(--liquid-muted)]">
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
                  <tr key={book.id} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/writer/analytics/books/${book.id}`} className="font-medium text-[var(--liquid-ink)] hover:underline">
                        {book.title}
                      </Link>
                      <span className="ml-2 align-middle"><PublicationStatusBadge status={book.status} /></span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{INT.format(book.chapters)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{INT.format(book.words)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{INT.format(book.readers)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{INT.format(book.completed)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{INT.format(book.sales)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{BRL.format(book.revenue_cents / 100)}</td>
                  </tr>
                ))}
                {insights.books.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-[var(--liquid-muted)]">Nenhum livro criado ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard strong>
          <h2 className="mb-3 font-semibold text-[var(--liquid-ink)]">Conteúdos mais concluídos</h2>
          {insights.topContent.length === 0 && <p className="text-sm text-[var(--liquid-muted)]">Nenhuma conclusão no período.</p>}
          <ol className="space-y-3">
            {insights.topContent.map((item) => (
              <li key={`${item.kind}:${item.id}`}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-[var(--liquid-ink)]" title={item.title}>{item.title}</span>
                  <span className="font-semibold tabular-nums text-[var(--liquid-ink)]">{INT.format(item.count)}</span>
                </div>
                <p className="text-xs text-[var(--liquid-muted)]">{KIND_LABEL[item.kind] ?? item.kind}</p>
                <div className="mt-1 h-1.5 rounded-full bg-black/5">
                  <div className="h-full rounded-full bg-[#2a78d6]" style={{ width: `${(item.count / topContentMax) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>
    </section>
  );
}
