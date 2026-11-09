import { apiPublicGet } from "@/lib/api/server";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

// Índice de sitemaps: cada arquivo aceita até 50 mil endereços.
export async function GET() {
  const first = await apiPublicGet<{ pageSize: number; total: number }>("/public/directory/sitemap?page=1", 3600);
  const pages = Math.max(1, Math.ceil((first?.total ?? 0) / (first?.pageSize ?? 50_000)));
  const entries = Array.from(
    { length: pages },
    (_, index) => `<sitemap><loc>${siteUrl()}/sitemaps/escritores/${index + 1}</loc></sitemap>`,
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</sitemapindex>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
}
