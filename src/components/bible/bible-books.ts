export type BibleVersionCode = "NVI" | "ACF";
export type BibleBookInfo = { abbrev: string; name: string; order: number };

export const VERSIONS: { code: BibleVersionCode; name: string }[] = [
  { code: "NVI", name: "Nova Versão Internacional" },
  { code: "ACF", name: "Almeida Corrigida Fiel" },
];

export const biblePath = (version: BibleVersionCode, ...parts: (string | number)[]) =>
  [`/reader/area/bible-${version.toLowerCase()}`, ...parts.map((part) => encodeURIComponent(String(part)))].join("/");

export const GROUPS = [
  { name: "Pentateuco", from: 1, to: 5 },
  { name: "Históricos", from: 6, to: 17 },
  { name: "Poéticos e Sabedoria", from: 18, to: 22 },
  { name: "Profetas Maiores", from: 23, to: 27 },
  { name: "Profetas Menores", from: 28, to: 39 },
  { name: "Evangelhos e Atos", from: 40, to: 44 },
  { name: "Cartas de Paulo", from: 45, to: 57 },
  { name: "Cartas Gerais", from: 58, to: 65 },
  { name: "Profecia", from: 66, to: 66 },
];

export const isOldTestament = (order: number) => order <= 39;

export const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/**
 * Entende referências como "Jo 3:16", "joão 3 16", "1 Co 13" ou "salmos 23".
 * Devolve null quando o texto não parece uma referência (vira busca por palavra).
 */
export function parseReference(input: string, books: BibleBookInfo[]) {
  const match = /^(\d?\s*[^\d:]+?)\s*(\d{1,3})(?:\s*[:.,\s]\s*(\d{1,3}))?\s*$/.exec(input.trim().toLowerCase());
  if (!match) return null;
  const book = resolveBook(match[1], books);
  if (!book) return null;
  return { book, chapter: Number(match[2]), verse: match[3] ? Number(match[3]) : undefined };
}

/** Encontra o livro por abreviação, nome completo ou início único do nome ("Lamentações"). */
export function resolveBook(input: string, books: BibleBookInfo[]) {
  const raw = input.trim().toLowerCase().replace(/\s+/g, "");
  const token = normalizeText(raw).replace(/\./g, "");
  const compact = (text: string) => normalizeText(text).replace(/\s+/g, "");
  return (
    books.find((item) => item.abbrev === raw) ??
    books.find((item) => compact(item.name) === token) ??
    books.find((item) => compact(item.abbrev) === token) ??
    (() => {
      const candidates = books.filter((item) => compact(item.name).startsWith(token));
      return token.length >= 2 && candidates.length === 1 ? candidates[0] : undefined;
    })() ??
    null
  );
}

/** "Gênesis 1-3" → Gênesis, capítulos [1, 2, 3]; "Judas 1" → Judas, [1]. */
export function parsePassage(passage: string, books: BibleBookInfo[]) {
  const match = /^(.+?)\s+(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\s*$/.exec(passage.trim());
  if (!match) return null;
  const book = resolveBook(match[1], books);
  if (!book) return null;
  const from = Number(match[2]);
  const to = match[3] ? Math.max(from, Number(match[3])) : from;
  return { book, chapters: Array.from({ length: Math.min(to - from + 1, 60) }, (_, index) => from + index) };
}

/** Nome ou abreviação de livro sem capítulo ("mateus", "1 co"). */
export function findBook(input: string, books: BibleBookInfo[]) {
  const token = normalizeText(input).replace(/[\s.]+/g, "");
  if (!token) return null;
  return (
    books.find((item) => normalizeText(item.name).replace(/\s+/g, "") === token) ??
    books.find((item) => item.abbrev === input.trim().toLowerCase()) ??
    null
  );
}

export function formatReference(name: string, chapter: number, verses: number[]) {
  if (!verses.length) return `${name} ${chapter}`;
  const sorted = [...verses].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let previous = sorted[0];
  for (const verse of [...sorted.slice(1), Number.NaN]) {
    if (verse === previous + 1) {
      previous = verse;
      continue;
    }
    ranges.push(start === previous ? `${start}` : `${start}-${previous}`);
    start = verse;
    previous = verse;
  }
  return `${name} ${chapter}:${ranges.join(",")}`;
}

export const HIGHLIGHTS = [
  { color: "yellow", label: "Amarelo", swatch: "bg-amber-300", mark: "bg-amber-300/45 dark:bg-amber-400/30" },
  { color: "green", label: "Verde", swatch: "bg-emerald-300", mark: "bg-emerald-300/45 dark:bg-emerald-400/25" },
  { color: "blue", label: "Azul", swatch: "bg-sky-300", mark: "bg-sky-300/45 dark:bg-sky-400/25" },
  { color: "pink", label: "Rosa", swatch: "bg-pink-300", mark: "bg-pink-300/45 dark:bg-pink-400/25" },
] as const;

export type HighlightColor = (typeof HIGHLIGHTS)[number]["color"];
export const markClass = (color: string | undefined) => HIGHLIGHTS.find((item) => item.color === color)?.mark ?? "";

export type LastRead = { version: BibleVersionCode; abbrev: string; name: string; chapter: number; at: number };
export const LAST_READ_KEY = "bible:last-read";
export const FONT_SIZE_KEY = "bible:font-size";

export function readLastRead(): LastRead | null {
  try {
    const value = JSON.parse(localStorage.getItem(LAST_READ_KEY) ?? "null");
    return value && typeof value.abbrev === "string" ? value : null;
  } catch {
    return null;
  }
}
