"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

const COLOR = { mrr: "#1baf7a", active: "#2a78d6" } as const;
const GRID = "rgb(0 0 0 / 0.07)";
const TICK = { fontSize: 12, fill: "var(--liquid-muted)" };
const axisProps = { tickLine: false, axisLine: false, tick: TICK } as const;
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const INT = new Intl.NumberFormat("pt-BR");

export type MrrMonth = { month: string; mrr: number; active: number };

export function MrrChart({ data }: { data: MrrMonth[] }) {
  const [metric, setMetric] = useState<"mrr" | "active">("mrr");
  const isMrr = metric === "mrr";
  const format = isMrr ? (value: number) => BRL.format(value) : (value: number) => INT.format(value);
  const points = data.map((row) => ({
    label: new Date(row.month).toLocaleDateString("pt-BR", { month: "short", year: "2-digit", timeZone: "UTC" }).replace(". de ", "/"),
    value: isMrr ? row.mrr / 100 : row.active,
  }));

  return (
    <div>
      <div role="tablist" aria-label="Métrica" className="mb-3 flex w-fit gap-0.5 rounded-full bg-black/5 p-0.5">
        {(["mrr", "active"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={metric === key}
            onClick={() => setMetric(key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              metric === key ? "bg-white text-[var(--liquid-ink)] shadow-sm" : "text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]",
            )}
          >
            {key === "mrr" ? "MRR" : "Planos ativos"}
          </button>
        ))}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`mrr-fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR[metric]} stopOpacity={0.25} />
                <stop offset="100%" stopColor={COLOR[metric]} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis
              width={isMrr ? 72 : 40}
              allowDecimals={false}
              tickFormatter={(value) => (isMrr ? BRL.format(value).replace(",00", "") : INT.format(value))}
              {...axisProps}
            />
            <Tooltip
              cursor={{ stroke: GRID }}
              content={({ active, label, payload }) =>
                active && payload?.length ? (
                  <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                    <p className="mb-1 font-semibold text-[var(--liquid-ink)]">{label}</p>
                    <p className="text-[var(--liquid-muted)]">
                      {isMrr ? "MRR" : "Planos ativos"}:{" "}
                      <span className="font-semibold tabular-nums text-[var(--liquid-ink)]">{format(Number(payload[0].value ?? 0))}</span>
                    </p>
                  </div>
                ) : null
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              name={isMrr ? "MRR" : "Planos ativos"}
              stroke={COLOR[metric]}
              strokeWidth={2}
              fill={`url(#mrr-fill-${metric})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{isMrr ? "MRR por mês" : "Planos ativos por mês"}</caption>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <td>{point.label}</td>
              <td>{format(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
