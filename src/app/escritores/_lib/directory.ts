export type WriterCounts = {
  bookCount: number;
  devotionalCount: number;
  prayerCount: number;
  verseCount: number;
  quoteCount: number;
};

export type DirectoryWriter = WriterCounts & {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
  lastPublishedAt: string | null;
};

export type DirectoryList = {
  page: number;
  pageSize: number;
  total: number;
  items: DirectoryWriter[];
};

export type WriterProfileData = WriterCounts & {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  colorPrimary: string | null;
  createdAt: string;
  lastPublishedAt: string | null;
  hasContent: boolean;
  latestDevotionals: { id: string; title: string; createdAt: string }[];
};

export const profilePath = (slug: string) => `/escritores/${encodeURIComponent(slug)}`;
export const registerPath = (slug: string) => `/reader/register?escritor=${encodeURIComponent(slug)}`;

const monthYear = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "America/Sao_Paulo" });
export const formatMonthYear = (date: string) => monthYear.format(new Date(date)).replace(" de ", " ");

export function plural(count: number, singular: string, pluralForm: string) {
  return `${count.toLocaleString("pt-BR")} ${count === 1 ? singular : pluralForm}`;
}

/** Só os tipos que o escritor já publicou. */
export function writerMetrics(counts: WriterCounts) {
  return [
    { value: counts.bookCount, singular: "livro", label: "livros" },
    { value: counts.devotionalCount, singular: "devocional", label: "devocionais" },
    { value: counts.prayerCount, singular: "oração", label: "orações" },
    { value: counts.verseCount, singular: "versículo", label: "versículos" },
    { value: counts.quoteCount, singular: "frase", label: "frases" },
  ].filter((metric) => metric.value > 0);
}

export function contentSummary(counts: WriterCounts) {
  return writerMetrics(counts)
    .map((metric) => plural(metric.value, metric.singular, metric.label))
    .join(" · ");
}
