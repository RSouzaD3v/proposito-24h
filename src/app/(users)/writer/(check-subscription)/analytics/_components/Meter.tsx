import { CHART } from "@/components/ledger/palette";

const INT = new Intl.NumberFormat("pt-BR");

/** Linha de ranking: rótulo, número e uma barra fina proporcional ao maior valor. */
export function Meter({
  label,
  value,
  max,
  detail,
  color = CHART.primary,
  hint,
}: {
  label: React.ReactNode;
  value: number;
  max: number;
  detail?: string;
  color?: string;
  hint?: string;
}) {
  const width = max > 0 ? Math.max(value > 0 ? 2 : 0, (value / max) * 100) : 0;
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate text-[var(--liquid-ink)]">{label}</span>
        <span className="shrink-0 tabular-nums text-[var(--liquid-muted)]">
          {detail ?? <strong className="font-semibold text-[var(--liquid-ink)]">{INT.format(value)}</strong>}
        </span>
      </div>
      {hint && <p className="text-xs text-[var(--liquid-muted)]">{hint}</p>}
      <div className="mt-1.5 h-1.5 rounded-full bg-[var(--admin-sunken)]">
        <div className="h-full rounded-full" style={{ width: `${width}%`, background: color }} />
      </div>
    </li>
  );
}
