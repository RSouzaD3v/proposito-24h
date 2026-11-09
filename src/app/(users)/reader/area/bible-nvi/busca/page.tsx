import { BibleSearchPage } from "@/components/bible/BibleSearchPage";

export const metadata = { title: "Buscar na Bíblia (NVI)" };

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q = "", page = "1" } = await searchParams;
  return <BibleSearchPage version="NVI" query={q} page={Math.max(1, Number.parseInt(page, 10) || 1)} />;
}
