import Link from "next/link";
import { Search } from "lucide-react";
import { apiGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { requireAdmin } from "../_lib/auth";
import { formatDate, INT, SUBSCRIPTION_STATUS } from "../_lib/format";
import { PageHeader } from "../_components/StatTile";
import { timeAgo } from "../_components/ActivityFeed";

export const metadata = { title: "Leitores · Admin" };

type Reader = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  lastAccess: string | null;
  deletedAt: string | null;
  freePlan: boolean;
  writer: { id: string; name: string } | null;
  subscription: { status: string; lifetime: boolean } | null;
  platforms: string[];
  stats: { purchases: number; devotionals: number; books: number; highlights: number; quizzes: number };
};

type ReadersResponse = {
  page: number;
  pageSize: number;
  total: number;
  counts: Record<Filter, number>;
  readers: Reader[];
};

type Filter = "all" | "active" | "inactive" | "never" | "subscribers" | "app" | "deleted";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Ativos (7d)" },
  { key: "subscribers", label: "Assinantes" },
  { key: "app", label: "Com app" },
  { key: "inactive", label: "Inativos (30d+)" },
  { key: "never", label: "Nunca voltaram" },
  { key: "deleted", label: "Excluídos" },
];

const PLATFORM: Record<string, string> = { ios: "iOS", android: "Android" };
const DAY_MS = 86_400_000;

function recency(lastAccess: string | null) {
  if (!lastAccess) return { label: "nunca", tone: "text-[var(--liquid-muted)]", dot: "bg-[#d3ccbf]" };
  const days = (Date.now() - new Date(lastAccess).getTime()) / DAY_MS;
  if (days <= 7) return { label: timeAgo(lastAccess), tone: "text-[var(--liquid-ink)]", dot: "bg-[var(--admin-good)]" };
  if (days <= 30) return { label: timeAgo(lastAccess), tone: "text-[var(--liquid-ink)]", dot: "bg-[var(--admin-warn)]" };
  return { label: timeAgo(lastAccess), tone: "text-[var(--liquid-muted)]", dot: "bg-[#d3ccbf]" };
}

export default async function ReadersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; filter?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = (await searchParams) ?? {};
  const filter = (FILTERS.find(({ key }) => key === params.filter)?.key ?? "all") as Filter;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const search = new URLSearchParams({ filter, page: String(page) });
  if (q) search.set("q", q);
  const data = await apiGet<ReadersResponse>(`/admin/readers?${search.toString()}`);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  const hrefWith = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q: q || undefined, filter: filter === "all" ? undefined : filter, page: undefined, ...changes };
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, value);
    const query = next.toString();
    return query ? `?${query}` : "?";
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Pessoas"
        title="Leitores"
        description={`${INT.format(data.counts.all)} leitores cadastrados · ${INT.format(data.counts.active)} usaram o app nos últimos 7 dias`}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filtro" className="-mx-1 flex gap-1 overflow-x-auto px-1">
          {FILTERS.map(({ key, label }) => (
            <Link
              key={key}
              href={hrefWith({ filter: key === "all" ? undefined : key })}
              aria-current={filter === key ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-baseline gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                filter === key
                  ? "bg-[var(--liquid-ink)] text-white"
                  : "text-[var(--liquid-muted)] hover:bg-[var(--admin-sunken)] hover:text-[var(--liquid-ink)]",
              )}
            >
              {label}
              <span className={cn("text-xs tabular-nums", filter === key ? "text-white/70" : "opacity-70")}>
                {INT.format(data.counts[key] ?? 0)}
              </span>
            </Link>
          ))}
        </nav>

        <form className="relative w-full lg:w-72" action="" method="get">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--liquid-muted)]" aria-hidden />
          <input
            name="q"
            defaultValue={q}
            placeholder="Nome, e-mail ou escritor"
            aria-label="Buscar leitor"
            className="h-9 w-full rounded-md border border-[var(--admin-line)] bg-white pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-[var(--liquid-muted)] focus:border-[var(--liquid-accent)] focus:shadow-[0_0_0_3px_rgb(160_88_42_/_0.12)]"
          />
        </form>
      </div>

      <GlassCard padding="none" className="overflow-hidden">
        {data.readers.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-[var(--liquid-muted)]">
            {q ? `Nenhum leitor encontrado para “${q}”.` : "Nenhum leitor neste filtro."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-[13px]">
              <thead>
                <tr className="border-b border-[var(--admin-line)] bg-[#faf8f4] text-left text-xs text-[var(--liquid-muted)]">
                  <th className="px-5 py-2.5 font-medium">Leitor</th>
                  <th className="px-3 py-2.5 font-medium">Escritor</th>
                  <th className="px-3 py-2.5 font-medium">Último acesso</th>
                  <th className="px-3 py-2.5 font-medium">Assinatura</th>
                  <th className="px-3 py-2.5 font-medium">App</th>
                  <th className="px-3 py-2.5 text-right font-medium" title="Devocionais · livros · destaques · quizzes">
                    Uso
                  </th>
                  <th className="px-5 py-2.5 text-right font-medium">Compras</th>
                </tr>
              </thead>
              <tbody>
                {data.readers.map((reader) => {
                  const seen = recency(reader.lastAccess);
                  const status = reader.subscription
                    ? reader.subscription.lifetime
                      ? { label: "Vitalícia", color: "#3f7d4f" }
                      : SUBSCRIPTION_STATUS[reader.subscription.status] ?? { label: reader.subscription.status, color: "#a59d90" }
                    : null;
                  const usage = reader.stats.devotionals + reader.stats.books + reader.stats.highlights + reader.stats.quizzes;
                  return (
                    <tr key={reader.id} className="border-b border-[var(--admin-line-soft)] last:border-0 hover:bg-[#faf8f4]">
                      <td className="max-w-[260px] px-5 py-2.5">
                        <p className="truncate font-medium text-[var(--liquid-ink)]">
                          {reader.deletedAt ? "Conta excluída" : reader.name || "Sem nome"}
                        </p>
                        <p className="truncate text-xs text-[var(--liquid-muted)]">
                          {reader.deletedAt ? `em ${formatDate(reader.deletedAt)}` : reader.email} · desde {formatDate(reader.createdAt)}
                        </p>
                      </td>
                      <td className="max-w-[160px] truncate px-3 py-2.5">
                        {reader.writer ? (
                          <Link href={`/admin/writer/${reader.writer.id}`} className="hover:underline hover:underline-offset-4">
                            {reader.writer.name}
                          </Link>
                        ) : (
                          <span className="text-[var(--liquid-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={cn("flex items-center gap-2", seen.tone)}>
                          <span className={cn("size-1.5 rounded-full", seen.dot)} aria-hidden />
                          {seen.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {status ? (
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-[2px]" style={{ background: status.color }} aria-hidden />
                            {status.label.replace(/s$/, "")}
                          </span>
                        ) : (
                          <span className="text-[var(--liquid-muted)]">{reader.freePlan ? "Acesso livre" : "—"}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--liquid-muted)]">
                        {reader.platforms.length ? reader.platforms.map((p) => PLATFORM[p] ?? p).join(", ") : "—"}
                      </td>
                      <td
                        className="px-3 py-2.5 text-right tabular-nums"
                        title={`${reader.stats.devotionals} devocionais · ${reader.stats.books} livros · ${reader.stats.highlights} destaques · ${reader.stats.quizzes} quizzes`}
                      >
                        {usage ? INT.format(usage) : <span className="text-[var(--liquid-muted)]">0</span>}
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums">
                        {reader.stats.purchases || <span className="text-[var(--liquid-muted)]">0</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--admin-line)] px-5 py-3 text-[13px] text-[var(--liquid-muted)]">
            <span className="tabular-nums">
              {INT.format((page - 1) * data.pageSize + 1)}–{INT.format(Math.min(page * data.pageSize, data.total))} de {INT.format(data.total)}
            </span>
            <span className="flex gap-1">
              <PageLink href={hrefWith({ page: String(page - 1) })} disabled={page <= 1}>
                ← Anterior
              </PageLink>
              <PageLink href={hrefWith({ page: String(page + 1) })} disabled={page >= pages}>
                Próxima →
              </PageLink>
            </span>
          </div>
        )}
      </GlassCard>
      <p className="text-xs text-[var(--liquid-muted)]">
        “Uso” soma devocionais concluídos, livros abertos, destaques na Bíblia e quizzes jogados. Passe o mouse para ver o detalhe.
      </p>
    </section>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  if (disabled) return <span className="rounded-md px-2.5 py-1 opacity-40">{children}</span>;
  return (
    <Link href={href} className="rounded-md border border-[var(--admin-line)] bg-white px-2.5 py-1 text-[var(--liquid-ink)] hover:bg-[var(--admin-sunken)]">
      {children}
    </Link>
  );
}
