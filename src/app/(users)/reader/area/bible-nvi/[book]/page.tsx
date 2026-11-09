import { BibleBookPage } from "@/components/bible/BibleBookPage";

export const metadata = { title: "Bíblia (NVI)" };

export default async function Page({ params }: { params: Promise<{ book: string }> }) {
  const { book } = await params;
  return <BibleBookPage version="NVI" abbrev={decodeURIComponent(book)} />;
}
