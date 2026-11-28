"use client";

import { useState } from "react";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { CHART } from "../../_lib/palette";

const INT = new Intl.NumberFormat("pt-BR");
const TICK = { fontSize: 11, fill: CHART.tick };
const axis = { tickLine: false, axisLine: false, tick: TICK } as const;

export type DailyRow = { day: string; signups: number; previousSignups: number; activeUsers: number; events: number };

const METRICS = {
  active: { label: "Leitores ativos", hint: "leitores com ao menos uma ação no dia" },
  events: { label: "Ações", hint: "devocionais, leituras, destaques, quiz, aberturas do app…" },
  signups: { label: "Cadastros", hint: "novos leitores, com o período anterior tracejado" },
} as const;

type Metric = keyof typeof METRICS;

function TooltipBox({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: { name?: string; value?: number; color?: string; stroke?: string; fill?: string }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--admin-line)] bg-white px-3 py-2 text-xs shadow-[0_6px_20px_rgb(40_30_15_/_0.08)]">
      <p className="mb-1 font-semibold text-[var(--liquid-ink)]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 text-[var(--liquid-muted)]">
          <span className="size-2 rounded-[2px]" style={{ background: entry.stroke ?? entry.fill ?? entry.color }} aria-hidden />
          {entry.name}: <span className="font-semibold tabular-nums text-[var(--liquid-ink)]">{INT.format(entry.value ?? 0)}</span>
        </p>
      ))}
    </div>
  );
}

export function DailyActivityChart({ data }: { data: DailyRow[] }) {
  const [metric, setMetric] = useState<Metric>("active");
  const points = data.map((row) => ({ ...row, label: `${row.day.slice(8, 10)}/${row.day.slice(5, 7)}` }));
  const total = data.reduce((sum, row) => sum + (metric === "active" ? row.activeUsers : metric === "events" ? row.events : row.signups), 0);
  const peak = data.reduce(
    (best, row) => {
      const value = metric === "active" ? row.activeUsers : metric === "events" ? row.events : row.signups;
      return value > best.value ? { value, day: row.day } : best;
    },
    { value: 0, day: "" },
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Métrica" className="flex gap-0.5 rounded-md bg-[var(--admin-sunken)] p-0.5">
          {(Object.keys(METRICS) as Metric[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={metric === key}
              onClick={() => setMetric(key)}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                metric === key
                  ? "bg-white text-[var(--liquid-ink)] shadow-[0_0_0_1px_var(--admin-line)]"
                  : "text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]",
              )}
            >
              {METRICS[key].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--liquid-muted)]">
          {metric !== "active" && <>{INT.format(total)} no período · </>}
          {peak.value > 0 && (
            <>
              pico de {INT.format(peak.value)} em {peak.day.slice(8, 10)}/{peak.day.slice(5, 7)}
            </>
          )}
        </p>
      </div>

      <div className="h-60 w-full md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          {metric === "signups" ? (
            <ComposedChart data={points} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap={2}>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="label" minTickGap={32} {...axis} />
              <YAxis width={36} allowDecimals={false} {...axis} />
              <Tooltip cursor={{ fill: "rgb(160 88 42 / 0.06)" }} content={<TooltipBox />} />
              <Bar dataKey="signups" name="Cadastros" fill={CHART.primary} radius={[3, 3, 0, 0]} maxBarSize={18} />
              <Line type="monotone" dataKey="previousSignups" name="Período anterior" stroke={CHART.comparison} strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={false} />
            </ComposedChart>
          ) : (
            <AreaChart data={points} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="engagement-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.14} />
                  <stop offset="100%" stopColor={CHART.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="label" minTickGap={32} {...axis} />
              <YAxis width={40} allowDecimals={false} tickFormatter={(value) => INT.format(value)} {...axis} />
              <Tooltip cursor={{ stroke: CHART.comparison, strokeDasharray: "3 3" }} content={<TooltipBox />} />
              <Area
                type="monotone"
                dataKey={metric === "active" ? "activeUsers" : "events"}
                name={METRICS[metric].label}
                stroke={CHART.primary}
                strokeWidth={2}
                fill="url(#engagement-fill)"
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-[var(--liquid-muted)]">{METRICS[metric].hint}</p>

      <table className="sr-only">
        <caption>{METRICS[metric].label} por dia</caption>
        <thead>
          <tr>
            <th>Dia</th>
            <th>Leitores ativos</th>
            <th>Ações</th>
            <th>Cadastros</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.day}>
              <td>{row.day}</td>
              <td>{row.activeUsers}</td>
              <td>{row.events}</td>
              <td>{row.signups}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
