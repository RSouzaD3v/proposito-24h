"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { addDays, startOfWeek, differenceInCalendarDays, format } from "date-fns";

const DAYS_LABEL = ["S", "T", "Q", "Q", "S", "S", "D"]; // Seg → Dom
const TZ = "America/Sao_Paulo";

function formatDayParam(date: Date) {
  return format(date, "yyyy-MM-dd");
}

interface WeekDayFilterProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    buttonBg: string;
    buttonText: string;
    text: string;
    independenteColor1: string;
    independenteColor2: string;
  };
  startAt: Date | null;
  currentDayIndex: number;
}

export function WeekDayFilter({
  colors,
  startAt,
  currentDayIndex,
}: WeekDayFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔹 Hoje (timezone SP)
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: TZ })
  );

  const todayParam = formatDayParam(now);
  const activeDayParam = searchParams.get("day") ?? todayParam;

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i)
  );

  function getDayIndexForDate(date: Date) {
    if (!startAt) return null;

    const start = new Date(startAt);
    start.setHours(0, 0, 0, 0);

    const current = new Date(date);
    current.setHours(0, 0, 0, 0);

    return differenceInCalendarDays(current, start) + 1;
  }

  function handleSelectDay(day: Date) {
    const dayIndex = getDayIndexForDate(day);

    // 🔒 bloqueia dias inválidos
    if (!dayIndex || dayIndex < 1 || dayIndex > currentDayIndex) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("day", formatDayParam(day));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center md:gap-4 gap-1 md:px-2 px-1">
      {days.map((day, index) => {
        const dayParam = formatDayParam(day);
        const dayIndex = getDayIndexForDate(day);

        const isDisabled =
          !dayIndex || dayIndex < 1 || dayIndex > currentDayIndex;

        const isActive = dayParam === activeDayParam;

        return (
          <button
            key={dayParam}
            onClick={() => handleSelectDay(day)}
            disabled={isDisabled}
            style={
              isActive
                ? {
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                    color: colors.buttonText,
                  }
                : {
                    color: isDisabled ? "#999" : colors.primary,
                    backgroundColor: "transparent",
                  }
            }
            className={`
              w-10 h-10 flex items-center justify-center rounded-full font-bold
              transition-all duration-200
              ${
                isDisabled
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer hover:scale-105 hover:opacity-90"
              }
              ${isActive ? "shadow-lg scale-105" : ""}
            `}
          >
            {DAYS_LABEL[index]}
          </button>
        );
      })}
    </div>
  );
}
