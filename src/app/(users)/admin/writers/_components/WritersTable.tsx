"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { cents, INT } from "../../_lib/format";

export type WriterRow = {
  writer_id: string;
  writer_name: string;
  revenue_cents: number;
  sales: number;
  subscribers: number;
  readers: number;
};

type SortKey = "writer_name" | "revenue_cents" | "sales" | "subscribers" | "readers";

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "writer_name", label: "Escritor" },
  { key: "revenue_cents", label: "Receita (30d)", numeric: true },
  { key: "sales", label: "Vendas (30d)", numeric: true },
  { key: "subscribers", label: "Assinantes", numeric: true },
  { key: "readers", label: "Leitores", numeric: true },
];

export function WritersTable({ rows }: { rows: WriterRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "revenue_cents", desc: true });

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    const filtered = term ? rows.filter((row) => row.writer_name.toLocaleLowerCase("pt-BR").includes(term)) : rows;
    return [...filtered].sort((a, b) => {
      const result =
        sort.key === "writer_name"
          ? a.writer_name.localeCompare(b.writer_name, "pt-BR")
          : Number(a[sort.key]) - Number(b[sort.key]);
      return sort.desc ? -result : result;
    });
  }, [rows, query, sort]);

  const toggle = (key: SortKey) =>
    setSort((current) => (current.key === key ? { key, desc: !current.desc } : { key, desc: key !== "writer_name" }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--liquid-muted)]" aria-hidden />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar escritor"
            aria-label="Buscar escritor"
            className="rounded-full border-white/60 bg-white/70 pl-9"
          />
        </div>
        <p className="text-xs text-[var(--liquid-muted)]">
          {INT.format(visible.length)} de {INT.format(rows.length)} escritores
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-y border-black/5 text-left text-xs text-[var(--liquid-muted)]">
              {COLUMNS.map((column) => {
                const active = sort.key === column.key;
                return (
                  <th
                    key={column.key}
                    aria-sort={active ? (sort.desc ? "descending" : "ascending") : "none"}
                    className={cn("px-3 py-2 font-medium first:pl-5", column.numeric && "text-right")}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(column.key)}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-[var(--liquid-ink)]",
                        active && "text-[var(--liquid-ink)]",
                      )}
                    >
                      {column.label}
                      {active && (sort.desc ? <ArrowDown className="size-3" aria-hidden /> : <ArrowUp className="size-3" aria-hidden />)}
                    </button>
                  </th>
                );
              })}
              <th className="w-10 pr-5" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.writer_id} className="group border-b border-black/5 transition-colors last:border-0 hover:bg-white/55">
                <td className="py-3 pl-5 pr-3">
                  <Link href={`/admin/writer/${row.writer_id}`} className="flex items-center gap-3 font-medium text-[var(--liquid-ink)]">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2a78d6]/10 text-xs font-semibold text-[#2a78d6]">
                      {row.writer_name.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate group-hover:underline">{row.writer_name}</span>
                  </Link>
                </td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums">{cents(row.revenue_cents)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{INT.format(row.sales)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{INT.format(row.subscribers)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{INT.format(row.readers)}</td>
                <td className="pr-5">
                  <Link href={`/admin/writer/${row.writer_id}`} aria-label={`Abrir ${row.writer_name}`}>
                    <ChevronRight className="size-4 text-[var(--liquid-muted)] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[var(--liquid-muted)]">
                  Nenhum escritor encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
