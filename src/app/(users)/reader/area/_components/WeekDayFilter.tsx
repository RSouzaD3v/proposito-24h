"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { addDays, startOfWeek, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const DAYS_LABEL = ["S", "T", "Q", "Q", "S", "S", "D"]; // Seg → Dom

const TZ = "America/Sao_Paulo";

function formatDayParam(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function WeekDayFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeDayParam = searchParams.get("day");

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: TZ })
  );

  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // segunda
  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i)
  );

  function handleSelectDay(day: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("day", formatDayParam(day));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-4 px-2">
      {days.map((day, index) => {
        const dayParam = formatDayParam(day);
        const isActive = dayParam === activeDayParam;

        return (
          <button
            key={dayParam}
            onClick={() => handleSelectDay(day)}
            className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all
              ${
                isActive
                  ? "bg-orange-500 text-white shadow-lg scale-105"
                  : "text-orange-300 hover:bg-orange-100"
              }
            `}
          >
            {DAYS_LABEL[index]}
          </button>
        );
      })}
    </div>
  );
}
