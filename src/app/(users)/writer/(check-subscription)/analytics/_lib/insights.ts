export type PeriodTotals = {
  netCents: number;
  sales: number;
  newReaders: number;
  newSubs: number;
  completions: number;
};

export type BookInsight = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  status: string;
  updatedAt: string;
  chapters: number;
  words: number;
  sales: number;
  revenue_cents: number;
  readers: number;
  completed: number;
};

export type Insights = {
  current: PeriodTotals;
  previous: PeriodTotals;
  activeReaders: number;
  canceledSubs: number;
  engagedReaders: number;
  engagementByDay: { day: string; kind: string; count: number }[];
  topContent: { id: string; kind: string; title: string; count: number }[];
  books: BookInsight[];
};

export const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const INT = new Intl.NumberFormat("pt-BR");

/** Variação percentual; sem base de comparação, não há percentual a mostrar. */
export function deltaOf(current: number, previous: number): number | "new" | null {
  if (previous === 0) return current === 0 ? null : "new";
  return Math.round(((current - previous) / previous) * 100);
}

/** Dias do período, inclusive os sem movimento, para o gráfico não pular datas. */
export function daysBetween(start: string | Date, end: string | Date) {
  const first = new Date(start).getTime();
  const count = Math.round((new Date(end).getTime() - first) / 86_400_000);
  return Array.from({ length: count }, (_, index) => {
    const iso = new Date(first + index * 86_400_000).toISOString().slice(0, 10);
    return { key: iso, label: `${iso.slice(8, 10)}/${iso.slice(5, 7)}` };
  });
}

export const dayKey = (value: string | Date) => new Date(value).toISOString().slice(0, 10);

export const PCT = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });
export const DECIMAL = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export type Audience = {
  start: string;
  end: string;
  riskDays: number;
  totalReaders: number;
  engagedReaders: number;
  averageActiveDays: number;
  averageDailyReaders: number;
  stickiness: number;
  heatmap: { weekday: number; hour: number; count: number }[];
  dailyActive: { day: string; readers: number }[];
  frequency: { bucket: string; readers: number }[];
  recency: { bucket: string; readers: number }[];
  contentMix: { kind: string; count: number; readers: number }[];
  activation: { newReaders: number; activated: number; medianHoursToFirstRead: number | null };
  cohorts: { week: string; size: number; weeks: number[] }[];
  streaks: { active: number; atLeast3: number; atLeast7: number; atLeast30: number; longest: number };
  devices: {
    platforms: { platform: string; readers: number }[];
    appReaders: number;
    dailyReminder: number;
    prayerReminder: number;
    newContentAlerts: number;
    webPush: number;
    reminderHours: { hour: number; readers: number }[];
  };
  books: { readers: number; finished: number };
  journeys: { id: string; title: string; active: boolean; started: number; reading: number; completed: number; recent: number }[];
  highlights: { book: string; chapter: number; verse: number; readers: number }[];
  topReaders: { id: string; name: string | null; completions: number; days: number; last: string; streak: number }[];
  atRisk: {
    count: number;
    readers: { id: string; name: string | null; email: string; lastAccess: string | null; status: string; lifetime: boolean }[];
  };
};

/** "há 3 dias", "há 2 meses"… para datas de acesso. */
export function timeAgo(value: string | Date | null | undefined, now = Date.now()) {
  if (!value) return "nunca";
  const days = Math.floor((now - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "há 1 mês" : `há ${months} meses`;
  const years = Math.floor(days / 365);
  return years <= 1 ? "há 1 ano" : `há ${years} anos`;
}

/** Duração legível a partir de horas (mediana até a primeira leitura). */
export function hoursLabel(hours: number | null) {
  if (hours === null) return "—";
  if (hours < 1) return "menos de 1 h";
  if (hours < 48) return `${Math.round(hours)} h`;
  return `${Math.round(hours / 24)} dias`;
}

export const KIND_LABEL: Record<string, string> = { devotional: "Devocionais", verse: "Versículos", quote: "Frases" };
