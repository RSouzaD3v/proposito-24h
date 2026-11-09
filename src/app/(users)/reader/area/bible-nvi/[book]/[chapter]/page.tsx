import { BibleChapterPage } from "@/components/bible/BibleChapterPage";

export const metadata = { title: "Bíblia (NVI)" };

export default async function Page({ params }: { params: Promise<{ book: string; chapter: string }> }) {
  const { book, chapter } = await params;
  return <BibleChapterPage version="NVI" abbrev={decodeURIComponent(book)} chapter={Number(chapter)} />;
}
