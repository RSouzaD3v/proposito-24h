// A Bíblia é pública: as consultas vão direto à API, sem cookie de sessão.
// O texto não muda, então as respostas ficam em cache por um dia.

export interface Book {
  id: number;
  abbrev: string;
  name: string;
  order: number;
}

export interface ChapterData {
  book: Book;
  chapter: number;
  verses: { verse: number; text: string }[];
  prev: number | null;
  next: number | null;
}

export interface SearchResult {
  page: number;
  pageSize: number;
  total: number;
  items: { abbrev: string; name: string; chapter: number; verse: number; text: string }[];
}

async function request<T>(path: string, revalidate = 86_400): Promise<T | null> {
  const response = await fetch(`${process.env.API_URL}/v1/bible${path}`, {
    headers: { "x-proxy-key": process.env.INTERNAL_API_KEY ?? "" },
    next: { revalidate },
  });
  if (response.status === 404 || response.status === 400) return null;
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

export function getChapter(abbrev: string, chapter: number, versionCode = "ACF") {
  return Number.isInteger(chapter) && chapter > 0
    ? request<ChapterData>(`/${versionCode}/${encodeURIComponent(abbrev)}/${chapter}`)
    : Promise.resolve(null);
}

export function searchBible(versionCode: string, query: string, page = 1) {
  const params = new URLSearchParams({ version: versionCode, q: query, page: String(page) });
  return request<SearchResult>(`/search?${params}`, 3600);
}

export async function getVerses(abbrev: string, chapter: number, versionCode = "ACF") {
  const data = await getChapter(abbrev, chapter, versionCode);
  return { book: (data?.book ?? null) as any, verses: (data?.verses ?? []) as any[] };
}

export async function getPrevNextChapter(abbrev: string, chapter: number, versionCode = "ACF") {
  const data = await getChapter(abbrev, chapter, versionCode);
  return { prev: data?.prev ?? null, next: data?.next ?? null };
}
