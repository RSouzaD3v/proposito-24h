"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { addDays, format, isSameDay, startOfDay, startOfWeek, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { cn } from "@/lib/utils";

const DAYS_LABEL = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const TZ = "America/Sao_Paulo";

const dayParam = (date: Date) => format(date, "yyyy-MM-dd");

export function WeekDayFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = toZonedTime(new Date(), TZ);
  const today = startOfDay(now);
  const yesterday = subDays(today, 1);
  const selected = searchParams.get("day") ?? dayParam(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  function select(day: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("day", dayParam(day));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: 7 }, (_, index) => {
        const day = addDays(weekStart, index);
        const selectable = isSameDay(day, today) || isSameDay(day, yesterday);
        const active = dayParam(day) === selected;
        return (
          <button
            key={index}
            type="button"
            disabled={!selectable}
            aria-pressed={active}
            title={selectable ? undefined : "Disponível apenas para ontem ou hoje"}
            onClick={() => select(day)}
            className={cn(
              "flex h-16 flex-col items-center justify-center rounded-2xl transition-colors",
              active
                ? "bg-[var(--liquid-accent)] text-[var(--liquid-on-accent)]"
                : selectable
                  ? "text-[var(--liquid-ink)] hover:bg-[var(--muted)]"
                  : "cursor-not-allowed text-[var(--liquid-muted)] opacity-45",
            )}
          >
            <span className="text-[0.6875rem] font-semibold">{DAYS_LABEL[index]}</span>
            <span className="mt-0.5 text-base font-bold tabular-nums">{format(day, "d")}</span>
          </button>
        );
      })}
    </div>
  );
}
