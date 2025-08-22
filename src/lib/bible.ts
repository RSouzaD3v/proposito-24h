// lib/bible.ts (Server-only helpers)
import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";


export const VERSION_CODE = process.env.BIBLE_VERSION_CODE || "ACF";


export const getBooks = cache(async () => {
return db.bibleBook.findMany({
orderBy: { order: "asc" },
select: { id: true, abbrev: true, name: true, order: true },
});
});


export async function getBookByAbbrev(abbrevParam: string) {
const abbrev = abbrevParam.toLowerCase();
const book = await db.bibleBook.findUnique({
where: { abbrev },
select: { id: true, abbrev: true, name: true, order: true },
});
return book;
}


export async function getChaptersOfBook(abbrevParam: string): Promise<number[]> {
const book = await getBookByAbbrev(abbrevParam);
if (!book) return [];
const rows = await db.bibleVerse.findMany({
where: { bookId: book.id, version: { code: VERSION_CODE } },
select: { chapter: true },
distinct: ["chapter"],
orderBy: { chapter: "asc" },
});
return rows.map((r) => r.chapter);
}


export async function getVerses(abbrevParam: string, chapterNum: number) {
const book = await getBookByAbbrev(abbrevParam);
if (!book) return { book: null, verses: [] as { verse: number; text: string }[] };
const verses = await db.bibleVerse.findMany({
where: {
bookId: book.id,
chapter: chapterNum,
version: { code: VERSION_CODE },
},
select: { verse: true, text: true },
orderBy: { verse: "asc" },
});
return { book, verses };
}


export async function getPrevNextChapter(abbrevParam: string, chapterNum: number) {
const chapters = await getChaptersOfBook(abbrevParam);
if (!chapters.length) return { prev: null as number | null, next: null as number | null };
const idx = chapters.indexOf(chapterNum);
const prev = idx > 0 ? chapters[idx - 1] : null;
const next = idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null;
return { prev, next };
}