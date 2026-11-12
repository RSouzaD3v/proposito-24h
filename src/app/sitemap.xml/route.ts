import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

// Páginas públicas da plataforma. Escritores não são listados: o leitor chega pelo endereço de cada um.
const PUBLIC_PATHS = ["/", "/docs", "/docs/leitor", "/docs/escritor"];

export async function GET() {
  const base = siteUrl();
  const urls = PUBLIC_PATHS.map((path) => `<url><loc>${base}${path === "/" ? "" : path}</loc></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
}
