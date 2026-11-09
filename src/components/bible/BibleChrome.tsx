import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BibleVersionCode } from "./bible-books";

/** Alterna entre NVI e ACF mantendo o leitor no mesmo ponto do texto. */
export function VersionSwitch({
  current,
  hrefFor,
  className,
}: {
  current: BibleVersionCode;
  hrefFor: (version: BibleVersionCode) => string;
  className?: string;
}) {
  return (
    <nav aria-label="Versão da Bíblia" className={cn("flex shrink-0 rounded-xl bg-[var(--muted)] p-1", className)}>
      {(["NVI", "ACF"] as const).map((version) => {
        const active = version === current;
        return (
          <Link
            key={version}
            href={hrefFor(version)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-bold transition",
              active
                ? "bg-[var(--reader-surface)] text-[var(--liquid-ink)] shadow-sm"
                : "text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]",
            )}
          >
            {version}
          </Link>
        );
      })}
    </nav>
  );
}

export function BibleTopBar({
  backHref,
  backLabel,
  title,
  children,
}: {
  backHref: string;
  backLabel: string;
  title?: ReactNode;
  children?: ReactNode;
}) {
  return (
    // À direita fica livre o espaço do controle fixo de música e tema da área do leitor.
    <div className="mb-6 flex items-center justify-between gap-3 pr-[5.25rem] lg:pr-0">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href={backHref}
          aria-label={backLabel}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--reader-surface)] text-[var(--liquid-ink)] transition hover:bg-[var(--muted)]"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        {title && <div className="min-w-0 truncate text-sm font-semibold text-[var(--liquid-muted)]">{title}</div>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

export const surfaceClass = "rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)]";
