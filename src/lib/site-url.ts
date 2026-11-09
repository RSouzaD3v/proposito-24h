/** Endereço público do site, usado em links canônicos, sitemap e cards de compartilhamento. */
export function siteUrl() {
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  if (!base || base.includes("localhost") || base.includes("lvh.me")) {
    return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  }
  return `https://${base}`;
}
