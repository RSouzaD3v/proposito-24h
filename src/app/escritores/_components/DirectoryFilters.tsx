"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";

const fieldClass =
  "h-11 w-full rounded-xl border border-[var(--input)] bg-[var(--reader-surface)] text-[14px] text-[var(--liquid-ink)] outline-none transition focus-visible:border-[var(--liquid-accent)] focus-visible:ring-[3px] focus-visible:ring-[var(--liquid-accent)]/20";

const SELECTS = [
  {
    param: "ordem",
    label: "Ordenar por",
    options: [
      ["", "Recomendados"],
      ["recentes", "Entrada mais recente"],
      ["antigos", "Entrada mais antiga"],
      ["atualizados", "Publicou por último"],
      ["nome", "Nome (A–Z)"],
    ],
  },
  {
    param: "entrou",
    label: "Data de entrada",
    options: [
      ["", "Qualquer data"],
      ["7d", "Últimos 7 dias"],
      ["30d", "Últimos 30 dias"],
      ["90d", "Últimos 90 dias"],
      ["1y", "Último ano"],
    ],
  },
  {
    param: "conteudo",
    label: "Conteúdo",
    options: [
      ["", "Todo conteúdo"],
      ["livros", "Com livros"],
      ["diario", "Com conteúdo diário"],
    ],
  },
] as const;

export function DirectoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const urlSearch = params.get("busca") ?? "";
  const [search, setSearch] = useState(urlSearch);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    next.delete("pagina");
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  };

  useEffect(() => {
    if (search.trim() === urlSearch) return;
    const timer = setTimeout(() => update({ busca: search.trim() }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, urlSearch]);

  const hasFilters = ["busca", "ordem", "entrou", "conteudo", "ativos"].some((key) => params.get(key));

  return (
    <div className={`grid gap-3 transition-opacity ${pending ? "opacity-60" : ""}`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--liquid-muted)]" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome"
            aria-label="Buscar escritor por nome"
            className={`${fieldClass} pr-3 pl-10 text-base md:text-[14px]`}
          />
        </div>
        {SELECTS.map((select) => (
          <div key={select.param} className="relative">
            <select
              aria-label={select.label}
              value={params.get(select.param) ?? ""}
              onChange={(e) => update({ [select.param]: e.target.value })}
              className={`${fieldClass} appearance-none pr-9 pl-3.5`}
            >
              {select.options.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[var(--liquid-muted)]" aria-hidden />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
        <label className="flex cursor-pointer items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={params.get("ativos") === "1"}
            onChange={(e) => update({ ativos: e.target.checked ? "1" : "" })}
            className="size-4 accent-[var(--liquid-accent)]"
          />
          Publicou nos últimos 30 dias
        </label>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
            className="flex items-center gap-1 font-semibold text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]"
          >
            <X className="size-3.5" aria-hidden /> Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
