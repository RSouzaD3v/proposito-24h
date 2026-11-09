import { BibleChapterPage } from "@/components/bible/BibleChapterPage";

export const metadata = { title: "Bíblia (ACF)" };

export default async function Page({ params }: { params: Promise<{ book: string; chapter: string }> }) {
  const { book, chapter } = await params;
  return <BibleChapterPage version="ACF" abbrev={decodeURIComponent(book)} chapter={Number(chapter)} />;
}
