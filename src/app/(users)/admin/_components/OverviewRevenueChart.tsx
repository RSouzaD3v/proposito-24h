"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

const CURRENT = "#2a78d6";
const PREVIOUS = "#8a94a6";
const GRID = "rgb(0 0 0 / 0.07)";
const TICK = { fontSize: 12, fill: "var(--liquid-muted)" };
const axisProps = { tickLine: false, axisLine: false, tick: TICK } as const;
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const INT = new Intl.NumberFormat("pt-BR");

export type RevenueDay = { day: string; revenue_cents: number; sales: number; previous_revenue_cents: number };

type Point = { label: string; current: number; previous?: number };

function ChartTooltip({
  active,
  label,
  payload,
  format,
}: {
  active?: boolean;
  label?: string;
  payload?: { name?: string; value?: number; color?: string }[];
  format: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-[var(--liquid-ink)]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 text-[var(--liquid-muted)]">
          <span className="size-2 rounded-full" style={{ background: entry.color }} aria-hidden />
          {entry.name}: <span className="font-semibold tabular-nums text-[var(--liquid-ink)]">{format(entry.value ?? 0)}</span>
        </p>
      ))}
    </div>
  );
}

export function OverviewRevenueChart({ data }: { data: RevenueDay[] }) {
  const [metric, setMetric] = useState<"revenue" | "sales">("revenue");
  const isRevenue = metric === "revenue";
  const format = isRevenue ? (value: number) => BRL.format(value) : (value: number) => INT.format(value);

  const points: Point[] = data.map((row) => ({
    label: `${row.day.slice(8, 10)}/${row.day.slice(5, 7)}`,
    current: isRevenue ? row.revenue_cents / 100 : row.sales,
    ...(isRevenue ? { previous: row.previous_revenue_cents / 100 } : {}),
  }));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Métrica do gráfico" className="flex gap-0.5 rounded-full bg-black/5 p-0.5">
          {(["revenue", "sales"] as const).map((key) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={metric === key}
              onClick={() => setMetric(key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                metric === key ? "bg-white text-[var(--liquid-ink)] shadow-sm" : "text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]",
              )}
            >
              {key === "revenue" ? "Receita líquida" : "Vendas"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--liquid-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: CURRENT }} aria-hidden /> Período atual
          </span>
          {isRevenue && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed" style={{ borderColor: PREVIOUS }} aria-hidden /> Período anterior
            </span>
          )}
        </div>
      </div>

      <div className="h-64 w-full md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="admin-revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CURRENT} stopOpacity={0.25} />
                <stop offset="100%" stopColor={CURRENT} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" minTickGap={36} {...axisProps} />
            <YAxis
              width={isRevenue ? 72 : 40}
              allowDecimals={!isRevenue ? false : undefined}
              tickFormatter={(value) => (isRevenue ? BRL.format(value).replace(",00", "") : INT.format(value))}
              {...axisProps}
            />
            <Tooltip cursor={{ stroke: GRID }} content={<ChartTooltip format={format} />} />
            {isRevenue && (
              <Line
                type="monotone"
                dataKey="previous"
                name="Período anterior"
                stroke={PREVIOUS}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={false}
              />
            )}
            <Area
              type="monotone"
              dataKey="current"
              name={isRevenue ? "Receita" : "Vendas"}
              stroke={CURRENT}
              strokeWidth={2}
              fill="url(#admin-revenue-fill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>{isRevenue ? "Receita líquida por dia" : "Vendas por dia"}</caption>
        <thead>
          <tr>
            <th>Dia</th>
            <th>Período atual</th>
            {isRevenue && <th>Período anterior</th>}
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <td>{point.label}</td>
              <td>{format(point.current)}</td>
              {isRevenue && <td>{format(point.previous ?? 0)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
