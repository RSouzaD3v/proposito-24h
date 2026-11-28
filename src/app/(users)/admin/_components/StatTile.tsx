import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { RANGES } from "../_lib/format";

/** Mantido por compatibilidade; o tom não pinta mais o card (o painel usa um único acento). */
type Tone = "blue" | "green" | "orange" | "violet" | "rose" | "slate";

type DeltaValue = number | "new" | null | undefined;

/** Variação contra o período anterior, em texto colorido discreto (sem pílula). */
export function Delta({ value, invert = false, className }: { value: DeltaValue; invert?: boolean; className?: string }) {
  if (value === undefined) return null;
  if (value === null || value === 0) {
    return <span className={cn("text-xs tabular-nums text-[var(--liquid-muted)]", className)}>{value === 0 ? "estável" : "—"}</span>;
  }
  if (value === "new") {
    return <span className={cn("text-xs font-medium text-[var(--liquid-accent)]", className)}>novo</span>;
  }
  const good = invert ? value < 0 : value > 0;
  return (
    <span
      className={cn("text-xs font-semibold tabular-nums", good ? "text-[var(--admin-good)]" : "text-[var(--admin-bad)]", className)}
      title="Variação contra o período anterior"
    >
      {value > 0 ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

export function StatTile({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  invert = false,
  href,
  size = "md",
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: Tone;
  /** Variação contra o período anterior; ausente quando a métrica não tem histórico. */
  delta?: DeltaValue;
  hint?: string;
  /** Quando subir é ruim (ex.: cancelamentos), inverte as cores da variação. */
  invert?: boolean;
  href?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const content = (
    <GlassCard padding="sm" className={cn("group flex h-full flex-col justify-between gap-4", href && "transition-colors hover:border-[#d3cbbd]", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--liquid-muted)]">
          {Icon && <Icon className="size-3.5 opacity-70" aria-hidden />}
          {label}
        </p>
        {href && (
          <ArrowUpRight
            className="size-4 text-[var(--liquid-muted)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            aria-hidden
          />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-semibold tabular-nums tracking-tight text-[var(--liquid-ink)]",
            size === "lg" ? "text-[1.75rem] leading-none md:text-[2rem]" : "text-2xl leading-none",
          )}
        >
          {value}
        </p>
        <p className="mt-2 flex min-w-0 items-baseline gap-2 truncate text-xs text-[var(--liquid-muted)]">
          <Delta value={delta} invert={invert} />
          {hint && <span className="truncate">{hint}</span>}
          {!hint && typeof delta === "number" && delta !== 0 && <span>vs. anterior</span>}
          {!hint && delta === "new" && <span>sem base anterior</span>}
        </p>
      </div>
    </GlassCard>
  );

  return href ? (
    <Link
      href={href}
      className="block h-full rounded-[var(--glass-radius)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--liquid-accent)]"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

/**
 * Faixa de indicadores em um único card, separados por filetes — lê como um livro-caixa,
 * em vez de uma grade de cartões soltos.
 */
export function KpiStrip({
  items,
  className,
}: {
  items: { label: string; value: string; delta?: DeltaValue; invert?: boolean; hint?: string; href?: string }[];
  className?: string;
}) {
  return (
    <GlassCard padding="none" className={cn("grid grid-cols-2 overflow-hidden lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none", className)}>
      {items.map((item, index) => {
        const body = (
          <>
            <p className="text-[13px] font-medium text-[var(--liquid-muted)]">{item.label}</p>
            <p className="mt-2 truncate text-[1.65rem] font-semibold leading-none tabular-nums tracking-tight text-[var(--liquid-ink)]">
              {item.value}
            </p>
            <p className="mt-2 flex items-baseline gap-2 truncate text-xs text-[var(--liquid-muted)]">
              <Delta value={item.delta} invert={item.invert} />
              {item.hint && <span className="truncate">{item.hint}</span>}
            </p>
          </>
        );
        const cell = cn(
          "block min-w-0 px-5 py-4 border-[var(--admin-line-soft)]",
          index % 2 === 1 && "border-l",
          index >= 2 && "border-t",
          "lg:border-t-0",
          index > 0 && "lg:border-l",
        );
        return item.href ? (
          <Link key={item.label} href={item.href} className={cn(cell, "transition-colors hover:bg-[#faf8f4]")}>
            {body}
          </Link>
        ) : (
          <div key={item.label} className={cell}>
            {body}
          </div>
        );
      })}
    </GlassCard>
  );
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--liquid-ink)]">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-[var(--liquid-muted)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Link discreto no canto de um bloco ("Ver todos →"). */
export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="shrink-0 text-xs font-medium text-[var(--liquid-muted)] underline-offset-4 transition-colors hover:text-[var(--liquid-ink)] hover:underline"
    >
      {children} →
    </Link>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--admin-line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[13px] text-[var(--liquid-muted)]">{eyebrow}</p>}
        <h1 className="text-[1.9rem] leading-tight md:text-[2.25rem]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[var(--liquid-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Seletor de período como controle segmentado; preserva os demais parâmetros da URL. */
export function RangeTabs({
  current,
  params = {},
}: {
  current: string;
  params?: Record<string, string | undefined>;
}) {
  const hrefFor = (key: string) => {
    const search = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) if (value) search.set(name, value);
    search.set("range", key);
    return `?${search.toString()}`;
  };
  return (
    <nav aria-label="Período" className="inline-flex rounded-lg border border-[var(--admin-line)] bg-[var(--admin-surface)] p-0.5">
      {RANGES.map(({ key, label }) => (
        <Link
          key={key}
          href={hrefFor(key)}
          scroll={false}
          aria-current={key === current ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
            key === current
              ? "bg-[var(--liquid-ink)] text-white"
              : "text-[var(--liquid-muted)] hover:bg-[var(--admin-sunken)] hover:text-[var(--liquid-ink)]",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
