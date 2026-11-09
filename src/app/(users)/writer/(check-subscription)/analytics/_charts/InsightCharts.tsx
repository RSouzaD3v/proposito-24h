"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Paleta categórica validada (visão de cores e contraste); legenda e tabela acompanham cada gráfico.
const SERIES = { devotional: "#2a78d6", verse: "#eb6834", quote: "#1baf7a" } as const;
const SERIES_LABEL = { devotional: "Devocionais", verse: "Versículos", quote: "Frases" } as const;
type SeriesKey = keyof typeof SERIES;
const SERIES_KEYS = Object.keys(SERIES) as SeriesKey[];

const GRID = "rgb(0 0 0 / 0.07)";
const TICK = { fontSize: 12, fill: "var(--liquid-muted)" };
const axisProps = { tickLine: false, axisLine: false, tick: TICK } as const;
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const INT = new Intl.NumberFormat("pt-BR");

type TooltipEntry = { name?: string; value?: number; color?: string };

function ChartTooltip({
  active,
  label,
  payload,
  format = (value) => INT.format(value),
}: {
  active?: boolean;
  label?: string;
  payload?: TooltipEntry[];
  format?: (value: number) => string;
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

function DataTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: (string | number)[][] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

export type DayValue = { label: string; value: number };

export function RevenueChart({ data }: { data: DayValue[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" minTickGap={36} {...axisProps} />
          <YAxis width={64} tickFormatter={(value) => BRL.format(value).replace(",00", "")} {...axisProps} />
          <Tooltip cursor={{ stroke: GRID }} content={<ChartTooltip format={(value) => BRL.format(value)} />} />
          <Area type="monotone" dataKey="value" name="Receita" stroke={SERIES.devotional} strokeWidth={2} fill={SERIES.devotional} fillOpacity={0.12} />
        </AreaChart>
      </ResponsiveContainer>
      <DataTable caption="Receita por dia" headers={["Dia", "Receita"]} rows={data.map(({ label, value }) => [label, BRL.format(value)])} />
    </div>
  );
}

export function NewSubscribersChart({ data }: { data: DayValue[] }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" minTickGap={36} {...axisProps} />
          <YAxis width={32} allowDecimals={false} {...axisProps} />
          <Tooltip cursor={{ fill: GRID }} content={<ChartTooltip />} />
          <Bar dataKey="value" name="Novos assinantes" fill={SERIES.devotional} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
      <DataTable caption="Novos assinantes por dia" headers={["Dia", "Novos assinantes"]} rows={data.map(({ label, value }) => [label, value])} />
    </div>
  );
}

export type EngagementDay = { label: string } & Record<SeriesKey, number>;

export function EngagementChart({ data }: { data: EngagementDay[] }) {
  return (
    <div>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--liquid-muted)]">
        {SERIES_KEYS.map((key) => (
          <li key={key} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: SERIES[key] }} aria-hidden />
            {SERIES_LABEL[key]}
          </li>
        ))}
      </ul>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" minTickGap={36} {...axisProps} />
            <YAxis width={32} allowDecimals={false} {...axisProps} />
            <Tooltip cursor={{ fill: GRID }} content={<ChartTooltip />} />
            {SERIES_KEYS.map((key) => (
              <Bar key={key} dataKey={key} name={SERIES_LABEL[key]} stackId="done" fill={SERIES[key]} stroke="#fff" strokeWidth={1} maxBarSize={24} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable
        caption="Conclusões por dia e tipo"
        headers={["Dia", ...SERIES_KEYS.map((key) => SERIES_LABEL[key])]}
        rows={data.map((day) => [day.label, ...SERIES_KEYS.map((key) => day[key])])}
      />
    </div>
  );
}
