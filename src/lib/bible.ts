// A Bíblia é pública: as consultas vão direto à API, sem cookie de sessão.

interface Book {
  id: number;
  abbrev: string;
  name: string;
  order: number;
}

async function request<T>(path: string): Promise<T | null> {
  const response = await fetch(`${process.env.API_URL}/v1/bible${path}`, {
    headers: { "x-proxy-key": process.env.INTERNAL_API_KEY ?? "" },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`API da Bíblia respondeu HTTP ${response.status}`);
  return (await response.json()) as T;
}

export async function getBooks() {
  return (await request<(Book & { testament: string })[]>("/books")) ?? [];
}

export function getBookByAbbrev(abbrev: string) {
  return request<Book>(`/books/${encodeURIComponent(abbrev)}`);
}

export async function getChaptersOfBook(abbrev: string, versionCode = "ACF") {
  return (await request<number[]>(`/${versionCode}/${encodeURIComponent(abbrev)}`)) ?? [];
}

interface ChapterData {
  book: Book;
  verses: { verse: number; text: string }[];
  prev: number | null;
  next: number | null;
}

const getChapter = (abbrev: string, chapter: number, versionCode: string) =>
  request<ChapterData>(`/${versionCode}/${encodeURIComponent(abbrev)}/${chapter}`);

export async function getVerses(abbrev: string, chapter: number, versionCode = "ACF") {
  const data = Number.isInteger(chapter) ? await getChapter(abbrev, chapter, versionCode) : null;
  return { book: (data?.book ?? null) as any, verses: (data?.verses ?? []) as any[] };
}

export async function getPrevNextChapter(abbrev: string, chapter: number, versionCode = "ACF") {
  const data = Number.isInteger(chapter) ? await getChapter(abbrev, chapter, versionCode) : null;
  return { prev: data?.prev ?? null, next: data?.next ?? null };
}
