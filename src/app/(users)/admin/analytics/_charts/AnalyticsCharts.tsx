"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

const GRID = "rgb(0 0 0 / 0.07)";
const TICK = { fontSize: 12, fill: "var(--liquid-muted)" };
const axisProps = { tickLine: false, axisLine: false, tick: TICK } as const;
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const INT = new Intl.NumberFormat("pt-BR");

function ChartTooltip({
  active,
  label,
  payload,
  format = (value) => INT.format(value),
}: {
  active?: boolean;
  label?: string;
  payload?: { name?: string; value?: number; color?: string; payload?: { fill?: string } }[];
  format?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-semibold text-[var(--liquid-ink)]">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 text-[var(--liquid-muted)]">
          <span className="size-2 rounded-full" style={{ background: entry.color ?? entry.payload?.fill }} aria-hidden />
          {entry.name}: <span className="font-semibold tabular-nums text-[var(--liquid-ink)]">{format(entry.value ?? 0)}</span>
        </p>
      ))}
    </div>
  );
}

export type StatusSlice = { key: string; label: string; count: number; color: string };

export function StatusDonut({ data }: { data: StatusSlice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.count, 0);
  if (total === 0) return <p className="py-16 text-center text-sm text-[var(--liquid-muted)]">Nenhuma assinatura ainda.</p>;
  return (
    <div className="relative h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="label" innerRadius="64%" outerRadius="92%" paddingAngle={2} stroke="none">
            {data.map((slice) => (
              <Cell key={slice.key} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums text-[var(--liquid-ink)]">{INT.format(total)}</span>
        <span className="text-xs text-[var(--liquid-muted)]">assinaturas</span>
      </div>
    </div>
  );
}

export type GrowthMonth = { month: string; writers: number; readers: number; subs: number; revenue_cents: number };

const GROWTH = [
  { key: "readers", label: "Leitores", color: "#2a78d6" },
  { key: "subs", label: "Assinaturas", color: "#1baf7a" },
  { key: "writers", label: "Escritores", color: "#7c5cd6" },
  { key: "revenue", label: "Receita", color: "#eb6834" },
] as const;

export function GrowthChart({ data }: { data: GrowthMonth[] }) {
  const [metric, setMetric] = useState<(typeof GROWTH)[number]["key"]>("readers");
  const meta = GROWTH.find(({ key }) => key === metric)!;
  const isRevenue = metric === "revenue";
  const format = isRevenue ? (value: number) => BRL.format(value) : (value: number) => INT.format(value);
  const points = data.map((row) => ({
    label: new Date(row.month).toLocaleDateString("pt-BR", { month: "short", year: "2-digit", timeZone: "UTC" }).replace(". de ", "/"),
    value: isRevenue ? row.revenue_cents / 100 : row[metric],
  }));

  return (
    <div>
      <div role="tablist" aria-label="Métrica de crescimento" className="mb-3 flex w-fit flex-wrap gap-0.5 rounded-full bg-black/5 p-0.5">
        {GROWTH.map(({ key, label }) => (
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
            {label}
          </button>
        ))}
      </div>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis
              width={isRevenue ? 72 : 40}
              allowDecimals={false}
              tickFormatter={(value) => (isRevenue ? BRL.format(value).replace(",00", "") : INT.format(value))}
              {...axisProps}
            />
            <Tooltip cursor={{ fill: "rgb(0 0 0 / 0.04)" }} content={<ChartTooltip format={format} />} />
            <Bar dataKey="value" name={meta.label} fill={meta.color} radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{meta.label} por mês</caption>
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
