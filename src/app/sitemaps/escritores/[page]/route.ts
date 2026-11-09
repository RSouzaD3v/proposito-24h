import { apiPublicGet } from "@/lib/api/server";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type SitemapPage = { items: { slug: string; lastPublishedAt: string | null }[] };

const xmlEscape = (value: string) => value.replace(/&/g, "&amp;").replace(/'/g, "&apos;");

export async function GET(_request: Request, { params }: { params: Promise<{ page: string }> }) {
  const page = Math.max(1, Number.parseInt((await params).page, 10) || 1);
  const data = await apiPublicGet<SitemapPage>(`/public/directory/sitemap?page=${page}`, 3600);
  const base = siteUrl();
  const staticPaths = ["/", "/escritores", "/docs", "/docs/leitor", "/docs/escritor"];
  const staticPages = page === 1 ? staticPaths.map((path) => `<url><loc>${base}${path}</loc></url>`) : [];
  const writers = (data?.items ?? []).map(({ slug, lastPublishedAt }) => {
    const lastmod = lastPublishedAt ? `<lastmod>${lastPublishedAt}</lastmod>` : "";
    return `<url><loc>${base}/escritores/${xmlEscape(encodeURIComponent(slug))}</loc>${lastmod}</url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...staticPages, ...writers].join("")}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
}
