"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

type Day = { id: string; dayNumber: number; passages: string };

export default function PlanClient({
  planId,
  planName,
  days,
  completedInitial,
}: {
  planId: string;
  planName: string;
  days: Day[];
  completedInitial: string[]; // dayIds
}) {
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(completedInitial)
  );

  const total = days.length;
  const done = completed.size;
  const pct = useMemo(() => Math.round((done / total) * 100), [done, total]);

  async function toggle(dayId: string, next: boolean) {
    // UI otimista
    setCompleted(prev => {
      const copy = new Set(prev);
      if (next) copy.add(dayId);
      else copy.delete(dayId);
      return copy;
    });

    // Chamada API
    startTransition(async () => {
      const res = await fetch("/api/reader/area/reading-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, dayId, completed: next }),
      });

      if (!res.ok) {
        // rollback em caso de erro
        setCompleted(prev => {
          const copy = new Set(prev);
          if (next) copy.delete(dayId);
          else copy.add(dayId);
          return copy;
        });
      }
    });
  }

  return (
    <section className="mx-auto max-w-3xl p-4">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-1">
            <Link href="/reader/area" className="bg-blue-600 text-white hover:bg-blue-800 p-2 rounded-sm flex items-center mb-4">
                Voltar para área do leitor
            </Link>
            <Link href="/reader/area/bible" className="bg-blue-600 text-white hover:bg-blue-800 p-2 rounded-sm flex items-center mb-4">
                Vamos ler a Bíblia 📖
            </Link>
        </div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">{planName}</h1>
        <div className="mt-2">
          <div className="h-3 w-full bg-gray-200 rounded">
            <div
              className="h-3 rounded bg-green-500 transition-all"
              style={{ width: `${pct}%` }}
              aria-label="Progresso"
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {done}/{total} dias • {pct}% {isPending ? " (sincronizando…)" : ""}
          </p>
        </div>
      </header>

      <ul className="space-y-2">
        {days.map((d) => {
          const checked = completed.has(d.id);
          return (
            <li
              key={d.id}
              className="flex items-start justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">Dia {d.dayNumber}</p>
                <p className="text-sm text-gray-700">{d.passages}</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={checked}
                  onChange={(e) => toggle(d.id, e.currentTarget.checked)}
                />
                <span className="text-sm">{checked ? "Concluído" : "Marcar"}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
