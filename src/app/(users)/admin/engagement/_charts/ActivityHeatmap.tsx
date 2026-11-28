"use client";

import { useState } from "react";
import { HEAT, heatColor } from "../../_lib/palette";

const INT = new Intl.NumberFormat("pt-BR");
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
/** Começa na segunda, como a semana é lida no Brasil no trabalho. */
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function ActivityHeatmap({ cells }: { cells: { dow: number; hour: number; events: number }[] }) {
  const [hover, setHover] = useState<{ dow: number; hour: number; events: number } | null>(null);
  const grid = new Map(cells.map((cell) => [`${cell.dow}-${cell.hour}`, cell.events]));
  const max = Math.max(0, ...cells.map((cell) => cell.events));
  const total = cells.reduce((sum, cell) => sum + cell.events, 0);

  const byHour = Array.from({ length: 24 }, (_, hour) => cells.filter((cell) => cell.hour === hour).reduce((sum, cell) => sum + cell.events, 0));
  const peakHour = byHour.indexOf(Math.max(...byHour));
  const byDay = Array.from({ length: 7 }, (_, dow) => cells.filter((cell) => cell.dow === dow).reduce((sum, cell) => sum + cell.events, 0));
  const peakDay = byDay.indexOf(Math.max(...byDay));

  if (total === 0) {
    return <p className="py-10 text-center text-sm text-[var(--liquid-muted)]">Sem ações registradas no período.</p>;
  }

  return (
    <div>
      <p className="mb-4 text-[13px] text-[var(--liquid-muted)]">
        Mais movimento às <span className="font-medium text-[var(--liquid-ink)]">{peakHour}h</span>, e o dia mais forte é{" "}
        <span className="font-medium text-[var(--liquid-ink)]">{DAY_NAMES[peakDay]}</span>. Bom horário para notificações e lançamentos.
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[560px]" onMouseLeave={() => setHover(null)}>
          <div className="grid grid-cols-[36px_repeat(24,minmax(0,1fr))] gap-[2px]">
            {ORDER.map((dow) => (
              <Row key={dow} dow={dow} grid={grid} max={max} onHover={setHover} hover={hover} />
            ))}
            <span />
            {Array.from({ length: 24 }, (_, hour) => (
              <span key={hour} className="pt-1 text-center text-[10px] tabular-nums text-[var(--liquid-muted)]">
                {hour % 3 === 0 ? `${hour}h` : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[var(--liquid-muted)]">
        <p className="min-h-4 tabular-nums" aria-live="polite">
          {hover
            ? `${DAY_NAMES[hover.dow]}, ${hover.hour}h–${hover.hour + 1}h · ${INT.format(hover.events)} ${hover.events === 1 ? "ação" : "ações"}`
            : `${INT.format(total)} ações no período · horário de Brasília`}
        </p>
        <span className="flex items-center gap-1.5">
          menos
          {["#f6f3ee", ...HEAT.slice(1)].map((color) => (
            <span key={color} className="size-2.5 rounded-[2px]" style={{ background: color }} aria-hidden />
          ))}
          mais
        </span>
      </div>

      <table className="sr-only">
        <caption>Ações por dia da semana e hora</caption>
        <thead>
          <tr>
            <th>Dia</th>
            {Array.from({ length: 24 }, (_, hour) => (
              <th key={hour}>{hour}h</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ORDER.map((dow) => (
            <tr key={dow}>
              <th>{DAY_NAMES[dow]}</th>
              {Array.from({ length: 24 }, (_, hour) => (
                <td key={hour}>{grid.get(`${dow}-${hour}`) ?? 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({
  dow,
  grid,
  max,
  hover,
  onHover,
}: {
  dow: number;
  grid: Map<string, number>;
  max: number;
  hover: { dow: number; hour: number } | null;
  onHover: (cell: { dow: number; hour: number; events: number }) => void;
}) {
  return (
    <>
      <span className="flex items-center text-[11px] text-[var(--liquid-muted)]">{DAYS[dow]}</span>
      {Array.from({ length: 24 }, (_, hour) => {
        const events = grid.get(`${dow}-${hour}`) ?? 0;
        const selected = hover?.dow === dow && hover.hour === hour;
        return (
          <span
            key={hour}
            onMouseEnter={() => onHover({ dow, hour, events })}
            className="aspect-square min-h-3 rounded-[3px] transition-shadow"
            style={{
              background: heatColor(events, max),
              boxShadow: selected ? "0 0 0 1.5px #1d1b17" : undefined,
            }}
            aria-hidden
          />
        );
      })}
    </>
  );
}
