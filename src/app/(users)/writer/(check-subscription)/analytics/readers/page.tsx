import Link from "next/link";
import { Search } from "lucide-react";
import { apiGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KpiStrip, PageHeader, RangeTabs, SectionTitle } from "@/components/ledger/Ledger";
import { rangeOf } from "@/components/ledger/ranges";
import { cn } from "@/lib/utils";
import { DailyReadersChart } from "../_charts/InsightCharts";
import { BRL, dayKey, daysBetween, INT, PCT, timeAgo } from "../_lib/insights";

export const metadata = { title: "Leitores — Insights" };

type ReaderRow = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  lastAccess: string | null;
  isSubscriber: boolean;
  spent: number;
  completions: number;
  lastReadAt: string | null;
};

type ReadersData = {
  start: string;
  end: string;
  totalReaders: number;
  newReaders: number;
  subsActive: number;
  newReadersByDay: { day: string; qty: number }[];
  readers: ReaderRow[];
};

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "subs", label: "Assinantes" },
  { key: "nonsubs", label: "Não assinantes" },
  { key: "new", label: "Novos no período" },
  { key: "risk", label: "Assinantes sumidos" },
] as const;

const DESCRIPTIONS: Record<string, string> = {
  all: "Os 100 cadastros mais recentes.",
  subs: "Assinantes ativos, em teste ou vitalícios.",
  nonsubs: "Leitores que ainda não assinaram — bons candidatos para um convite.",
  new: "Quem chegou no período selecionado.",
  risk: "Assinantes que não abrem o app há 14 dias ou mais. Um recado pessoal costuma trazê-los de volta.",
};

/** Atividade do leitor a partir do último acesso. */
function activityOf(lastAccess: string | null) {
  if (!lastAccess) return { label: "Nunca acessou", tone: "text-[var(--liquid-muted)]", dot: "#cfc8bb" };
  const days = (Date.now() - new Date(lastAccess).getTime()) / 86_400_000;
  if (days < 7) return { label: timeAgo(lastAccess), tone: "text-[var(--admin-good)]", dot: "#3f7d4f" };
  if (days < 30) return { label: timeAgo(lastAccess), tone: "text-[var(--liquid-ink)]", dot: "#c27c12" };
  return { label: timeAgo(lastAccess), tone: "text-[var(--admin-bad)]", dot: "#b4412f" };
}

export default async function WriterReadersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; range?: string; filter?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const q = sp.q?.trim() || "";
  const filter = FILTERS.some(({ key }) => key === sp.filter) ? (sp.filter as string) : "all";
  const range = rangeOf(sp.range);
  const query = new URLSearchParams({ range: range.key, filter, ...(q ? { q } : {}) });
  const data = await apiGet<ReadersData>(`/writer/analytics/readers?${query}`);

  const days = daysBetween(data.start, data.end);
  const signups = new Map(data.newReadersByDay.map(({ day, qty }) => [dayKey(day), qty]));
  const hrefFor = (next: Record<string, string>) => {
    const params = new URLSearchParams({ range: range.key, filter, ...(q ? { q } : {}), ...next });
    return `/writer/analytics/readers?${params}`;
  };

  return (
    <section className="w-full space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="Leitores"
        description="Sua base de leitores, quem está por perto e quem precisa de um recado."
        actions={<RangeTabs current={range.key} params={{ filter, q }} />}
      />

      <KpiStrip
        items={[
          { label: "Leitores", value: INT.format(data.totalReaders), hint: "cadastrados" },
          { label: "Novos no período", value: INT.format(data.newReaders), href: hrefFor({ filter: "new" }) },
          { label: "Assinantes", value: INT.format(data.subsActive), href: hrefFor({ filter: "subs" }) },
          {
            label: "Conversão",
            value: PCT.format(data.totalReaders ? data.subsActive / data.totalReaders : 0),
            hint: "leitores que assinam",
          },
        ]}
      />

      <GlassCard>
        <SectionTitle title="Novos leitores por dia" description="Cadastros no seu espaço durante o período." />
        <DailyReadersChart name="Novos leitores" data={days.map(({ key, label }) => ({ label, value: signups.get(key) ?? 0 }))} />
      </GlassCard>

      <GlassCard padding="none" className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[var(--admin-line-soft)] p-5 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Segmento" className="flex flex-wrap gap-1.5">
            {FILTERS.map(({ key, label }) => (
              <Link
                key={key}
                href={hrefFor({ filter: key })}
                scroll={false}
                aria-current={key === filter ? "page" : undefined}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  key === filter
                    ? "border-[var(--liquid-ink)] bg-[var(--liquid-ink)] text-white"
                    : "border-[var(--admin-line)] bg-white text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <form className="flex gap-2 lg:w-80" action="/writer/analytics/readers" method="get" role="search">
            <input type="hidden" name="filter" value={filter} />
            <input type="hidden" name="range" value={range.key} />
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[var(--liquid-muted)]" aria-hidden />
              <Input name="q" placeholder="Nome ou e-mail" defaultValue={q} className="h-9 pl-8" aria-label="Buscar leitor" />
            </div>
            <Button type="submit" variant="outline" className="h-9">
              Buscar
            </Button>
          </form>
        </div>

        <p className="px-5 pt-4 text-xs text-[var(--liquid-muted)]">
          {DESCRIPTIONS[filter]} {data.readers.length === 100 && "Mostrando os primeiros 100."}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-line-soft)] text-left text-xs text-[var(--liquid-muted)]">
                <th className="px-5 py-2.5 font-medium">Leitor</th>
                <th className="px-3 py-2.5 font-medium">Situação</th>
                <th className="px-3 py-2.5 font-medium">Último acesso</th>
                <th className="px-3 py-2.5 text-right font-medium">Leituras no período</th>
                <th className="px-3 py-2.5 font-medium">Desde</th>
                <th className="px-5 py-2.5 text-right font-medium">Gasto total</th>
              </tr>
            </thead>
            <tbody>
              {data.readers.map((reader) => {
                const activity = activityOf(reader.lastAccess);
                return (
                  <tr key={reader.id} className="border-b border-[var(--admin-line-soft)] transition-colors last:border-0 hover:bg-[#faf8f4]">
                    <td className="max-w-72 px-5 py-2.5">
                      <Link href={`/writer/analytics/readers/${reader.id}`} className="group flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--admin-sunken)] text-[13px] font-semibold text-[var(--liquid-ink)]">
                          {(reader.name || reader.email).charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-[var(--liquid-ink)] underline-offset-4 group-hover:underline">
                            {reader.name || "Sem nome"}
                          </span>
                          <span className="block truncate text-xs text-[var(--liquid-muted)]">{reader.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      {reader.isSubscriber ? (
                        <span className="rounded-md bg-[#f3e6da] px-2 py-0.5 text-xs font-semibold text-[#7a3f19]">Assinante</span>
                      ) : (
                        <span className="rounded-md bg-[var(--admin-sunken)] px-2 py-0.5 text-xs font-medium text-[var(--liquid-muted)]">Leitor</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("flex items-center gap-2 text-[13px]", activity.tone)}>
                        <span className="size-2 rounded-full" style={{ background: activity.dot }} aria-hidden />
                        {activity.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {reader.completions ? (
                        <span title={reader.lastReadAt ? `Última leitura ${timeAgo(reader.lastReadAt)}` : undefined}>
                          {INT.format(reader.completions)}
                        </span>
                      ) : (
                        <span className="text-[var(--liquid-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[13px] text-[var(--liquid-muted)]">
                      {new Date(reader.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{BRL.format(reader.spent / 100)}</td>
                  </tr>
                );
              })}
              {data.readers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[var(--liquid-muted)]">
                    {filter === "risk" ? "Nenhum assinante sumido. Ótimo sinal." : "Nenhum leitor encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </section>
  );
}
