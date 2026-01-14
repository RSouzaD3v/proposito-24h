import { differenceInCalendarDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Sao_Paulo";

export function useDailyIndex(startAt: Date) {
  const now = new Date();

  const startDate = toZonedTime(startAt, TIMEZONE);
  const today = toZonedTime(now, TIMEZONE);

  // zera horas
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = differenceInCalendarDays(today, startDate);

  return diffDays + 1;
}
