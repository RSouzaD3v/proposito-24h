"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Highlighter, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BibleTopBar, VersionSwitch, surfaceClass } from "./BibleChrome";
import { HIGHLIGHTS, biblePath, markClass, type BibleVersionCode } from "./bible-books";

type Item = { abbrev: string; name: string; chapter: number; verse: number; color: string; text: string | null };
type Page = { page: number; pageSize: number; total: number; items: Item[] };

export function BibleHighlightsPage({ version }: { version: BibleVersionCode }) {
  const [color, setColor] = useState<string>("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    const params = new URLSearchParams({ version, page: String(page), ...(color ? { color } : {}) });
    fetch(`/api/v1/reader/bible/highlights?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((result: Page) => {
        setData(result);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, [version, page, color]);

  useEffect(load, [load]);

  const remove = async (item: Item) => {
    setData((current) =>
      current ? { ...current, total: current.total - 1, items: current.items.filter((row) => row !== item) } : current,
    );
    await fetch("/api/v1/reader/bible/highlights", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book: item.abbrev, chapter: item.chapter, verses: [item.verse], color: null }),
    }).catch(() => load());
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;
  const filters = [{ color: "", label: "Todos", swatch: "" }, ...HIGHLIGHTS];

  return (
    <>
      <BibleTopBar backHref={biblePath(version)} backLabel="Voltar para a Bíblia" title="Bíblia">
        <VersionSwitch current={version} hrefFor={(code) => biblePath(code, "destaques")} />
      </BibleTopBar>
      <h1 className="text-[2rem] leading-tight text-[var(--liquid-ink)]">Meus destaques</h1>
      <p className="mt-1 mb-6 text-sm text-[var(--liquid-muted)]">Versículos que você marcou, do mais recente ao mais antigo.</p>

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar por cor">
        {filters.map((item) => {
          const active = color === item.color;
          return (
            <button
              key={item.color || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setColor(item.color);
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                active
                  ? "border-[var(--liquid-ink)] bg-[var(--liquid-ink)] text-[var(--reader-surface)]"
                  : "border-[var(--border)] bg-[var(--reader-surface)] text-[var(--liquid-ink)] hover:bg-[var(--muted)]/50",
              )}
            >
              {item.swatch && <span className={cn("size-3 rounded-full", item.swatch)} aria-hidden />}
              {item.label}
            </button>
          );
        })}
      </div>

      {failed ? (
        <p className={cn(surfaceClass, "p-5 text-center text-sm text-[var(--liquid-muted)]")}>
          Não foi possível carregar seus destaques agora.
        </p>
      ) : !data ? (
        <div className="grid gap-2" role="status" aria-label="Carregando">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : data.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--input)] p-8 text-center">
          <Highlighter className="mx-auto size-6 text-[var(--reader-gold)]" aria-hidden />
          <p className="mt-3 font-semibold text-[var(--liquid-ink)]">Nenhum destaque {color ? "nesta cor" : "ainda"}</p>
          <p className="mt-1 text-sm text-[var(--liquid-muted)]">Durante a leitura, toque em um versículo e escolha uma cor.</p>
        </div>
      ) : (
        <ul className="grid gap-2">
          {data.items.map((item) => (
            <li key={`${item.abbrev}-${item.chapter}-${item.verse}`} className={cn(surfaceClass, "flex items-start gap-2 p-4")}>
              <Link href={`${biblePath(version, item.abbrev, item.chapter)}#v${item.verse}`} className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[var(--reader-gold)]">
                  {item.name} {item.chapter}:{item.verse}
                </span>
                <span className="reader-serif mt-1 block text-[16px] leading-relaxed text-[var(--liquid-ink)]">
                  <span className={cn("rounded-[3px] box-decoration-clone", markClass(item.color))}>
                    {item.text ?? "Texto indisponível nesta versão."}
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label={`Remover destaque de ${item.name} ${item.chapter}:${item.verse}`}
                className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--liquid-muted)] transition hover:bg-[var(--muted)] hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-between text-sm font-semibold" aria-label="Páginas">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-30">
            ← Anterior
          </button>
          <span className="font-normal text-[var(--liquid-muted)]">
            Página {page} de {totalPages}
          </span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="disabled:opacity-30">
            Próxima →
          </button>
        </nav>
      )}
    </>
  );
}
