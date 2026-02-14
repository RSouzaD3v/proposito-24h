"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { addDays, startOfWeek, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

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
}

export function WeekDayFilter({ colors }: WeekDayFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeDayParam = searchParams.get("day");

  const now = toZonedTime(new Date(), TZ);

  const todayParam = formatDayParam(now);

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i)
  );

  function handleSelectDay(day: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("day", formatDayParam(day));
    router.push(`?${params.toString()}`);
  }

  return (
    <div
      className="flex items-center gap-2 md:gap-6 mb-10 mt-3 px-2"
      style={{
        ["--primary" as any]: colors.primary,
        ["--secondary" as any]: colors.secondary,
        ["--buttonText" as any]: colors.buttonText,
      }}
    >
      {days.map((day, index) => {
        const dayParam = formatDayParam(day);

        const isActive =
          activeDayParam
            ? dayParam === activeDayParam
            : dayParam === todayParam; // 👈 fallback para hoje

        return (
          <button
            key={dayParam}
            onClick={() => handleSelectDay(day)}
            className={`
              w-10 h-10
              flex items-center justify-center
              rounded-full
              font-bold
              transition-all duration-200
              ${
                isActive
                  ? "bg-primary text-white shadow-lg scale-105 opacity-100"
                  : "bg-secondary text-(--buttonText) opacity-20 hover:opacity-70"
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
