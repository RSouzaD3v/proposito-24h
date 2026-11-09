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
