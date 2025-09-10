// lib/bible.ts
import { db } from "@/lib/db";

/** Cache simples de versão -> id (memória do processo) */
const versionIdCache: Record<string, string> = {};

async function getVersionIdByCode(code: string = "ACF") {
  const key = code.toUpperCase();
  if (versionIdCache[key]) return versionIdCache[key];

  const v = await db.bibleVersion.findUnique({ where: { code: key } });
  if (!v) throw new Error(`BibleVersion não encontrada para code=${key}`);
  versionIdCache[key] = v.id;
  return v.id;
}

/** Livros ordenados (compartilhado entre versões) */
export async function getBooks() {
  const books = await db.bibleBook.findMany({
    orderBy: { order: "asc" },
    select: { id: true, abbrev: true, name: true, order: true },
  });

  // adiciona um campo de conveniência "testament" (old/new)
  return books.map(b => ({
    ...b,
    testament: b.order <= 39 ? "old" : "new",
  }));
}

export async function getBookByAbbrev(abbrev: string) {
  return db.bibleBook.findUnique({
    where: { abbrev },
    select: { id: true, abbrev: true, name: true, order: true },
  });
}

/** Lista de capítulos disponíveis para um livro na versão escolhida */
export async function getChaptersOfBook(abbrev: string, versionCode = "ACF") {
  const versionId = await getVersionIdByCode(versionCode);
  const book = await getBookByAbbrev(abbrev);
  if (!book) return [];

  // Distinct chapters dessa versão/livro
  const rows = await db.bibleVerse.findMany({
    where: { versionId, bookId: book.id },
    distinct: ["chapter"],
    orderBy: { chapter: "asc" },
    select: { chapter: true },
  });

  return rows.map(r => r.chapter);
}

/** Versículos de um capítulo para a versão escolhida */
export async function getVerses(
  abbrev: string,
  chapter: number,
  versionCode = "ACF"
) {
  const versionId = await getVersionIdByCode(versionCode);
  const book = await getBookByAbbrev(abbrev);
  if (!book) return { book: null as any, verses: [] as any[] };

  const verses = await db.bibleVerse.findMany({
    where: { versionId, bookId: book.id, chapter },
    orderBy: { verse: "asc" },
    select: { verse: true, text: true },
  });

  return { book, verses };
}

/** Navegação prev/next capítulo (respeitando a versão) */
export async function getPrevNextChapter(
  abbrev: string,
  chapter: number,
  versionCode = "ACF"
) {
  const versionId = await getVersionIdByCode(versionCode);
  const book = await getBookByAbbrev(abbrev);
  if (!book) return { prev: null as number | null, next: null as number | null };

  const first = await db.bibleVerse.findFirst({
    where: { versionId, bookId: book.id },
    orderBy: { chapter: "asc" },
    select: { chapter: true },
  });
  const last = await db.bibleVerse.findFirst({
    where: { versionId, bookId: book.id },
    orderBy: { chapter: "desc" },
    select: { chapter: true },
  });

  const min = first?.chapter ?? 1;
  const max = last?.chapter ?? 1;

  const prev = chapter > min ? chapter - 1 : null;
  const next = chapter < max ? chapter + 1 : null;
  return { prev, next };
}
