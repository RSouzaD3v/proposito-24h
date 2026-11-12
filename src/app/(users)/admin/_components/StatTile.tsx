import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronRight, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "orange" | "violet" | "rose" | "slate";

const TONES: Record<Tone, string> = {
  blue: "bg-[#2a78d6]/12 text-[#2a78d6]",
  green: "bg-[#1baf7a]/12 text-[#138a60]",
  orange: "bg-[#eb6834]/12 text-[#c4521f]",
  violet: "bg-[#7c5cd6]/12 text-[#6446c2]",
  rose: "bg-[#d64545]/12 text-[#b83232]",
  slate: "bg-[#5a6b85]/12 text-[#46546b]",
};

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "blue",
  delta,
  hint,
  invert = false,
  href,
  size = "md",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
  /** Variação contra o período anterior; ausente quando a métrica não tem histórico. */
  delta?: number | "new" | null;
  hint?: string;
  /** Quando subir é ruim (ex.: cancelamentos), inverte as cores da variação. */
  invert?: boolean;
  href?: string;
  size?: "md" | "lg";
}) {
  const good = typeof delta === "number" && (invert ? delta < 0 : delta > 0);
  const content = (
    <GlassCard strong interactive={Boolean(href)} padding="sm" className="group flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className={cn("flex size-9 items-center justify-center rounded-xl", TONES[tone])}>
          <Icon className="size-[18px]" aria-hidden />
        </span>
        {typeof delta === "number" && delta !== 0 && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
              good ? "bg-emerald-100/80 text-emerald-800" : "bg-red-100/80 text-red-800",
            )}
            title="Variação contra o período anterior"
          >
            {delta > 0 ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
        )}
        {delta === "new" && (
          <span className="rounded-full bg-sky-100/80 px-2 py-0.5 text-xs font-semibold text-sky-800">Novo</span>
        )}
        {href && (delta === undefined || delta === null || delta === 0) && (
          <ChevronRight className="size-4 text-[var(--liquid-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[var(--liquid-muted)]">{label}</p>
        <p
          className={cn(
            "mt-0.5 truncate font-bold tabular-nums tracking-tight text-[var(--liquid-ink)]",
            size === "lg" ? "text-2xl md:text-[1.75rem]" : "text-xl md:text-2xl",
          )}
        >
          {value}
        </p>
        <p className="mt-1 truncate text-xs text-[var(--liquid-muted)]">
          {typeof delta === "number" && delta === 0 && "Igual ao período anterior"}
          {typeof delta === "number" && delta !== 0 && "vs. período anterior"}
          {delta === "new" && "Sem movimento no período anterior"}
          {delta === null && "Sem movimento nos dois períodos"}
          {hint && (delta === undefined ? hint : ` · ${hint}`)}
        </p>
      </div>
    </GlassCard>
  );

  return href ? (
    <Link href={href} className="block h-full rounded-[var(--glass-radius)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--liquid-accent)]">
      {content}
    </Link>
  ) : (
    content
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
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-semibold tracking-tight text-[var(--liquid-ink)]">{title}</h2>
        {description && <p className="text-xs text-[var(--liquid-muted)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
