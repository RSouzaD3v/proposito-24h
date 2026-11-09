import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function KpiTile({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  /** Variação contra o período anterior; ausente quando a métrica não tem histórico. */
  delta?: number | "new" | null;
  hint?: string;
}) {
  return (
    <GlassCard strong padding="sm">
      <p className="text-sm text-[var(--liquid-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--liquid-ink)]">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-[var(--liquid-muted)]">
        {typeof delta === "number" && delta === 0 && "Igual ao período anterior"}
        {typeof delta === "number" && delta !== 0 && (
          <>
            {delta > 0 ? (
              <ArrowUpRight className="size-3.5 text-emerald-700" aria-hidden />
            ) : (
              <ArrowDownRight className="size-3.5 text-red-700" aria-hidden />
            )}
            <span className="font-semibold tabular-nums text-[var(--liquid-ink)]">
              {delta > 0 ? "+" : ""}
              {delta}%
            </span>
            vs. período anterior
          </>
        )}
        {delta === "new" && "Sem movimento no período anterior"}
        {delta === null && "Sem movimento nos dois períodos"}
        {delta === undefined && hint}
      </p>
    </GlassCard>
  );
}
