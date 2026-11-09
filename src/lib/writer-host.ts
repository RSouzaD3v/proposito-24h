import { headers } from "next/headers";
import { apiGetOrNull } from "@/lib/api/server";

export type HostWriter = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
};

function subdomainOf(hostname: string) {
  if (hostname.endsWith("localhost") || hostname.endsWith("lvh.me")) {
    const parts = hostname.split(".");
    return parts.length > 1 ? parts[0] : "";
  }
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "example.com";
  if (hostname === baseDomain || hostname === `www.${baseDomain}`) return "";
  return hostname.replace(`.${baseDomain}`, "");
}

/**
 * Identifica o escritor dono do subdomínio acessado; `writer` é null no domínio raiz ou se não existir.
 * `chosenSlug` vale só no domínio raiz: é o escritor escolhido na página de escritores.
 */
export async function getWriterFromHost(chosenSlug?: string) {
  const host = (await headers()).get("host") ?? "";
  const subdomain = subdomainOf(host.split(":")[0]) || (chosenSlug ?? "");
  const writer = subdomain
    ? await apiGetOrNull<HostWriter>(`/public/writers/by-subdomain/${encodeURIComponent(subdomain)}`)
    : null;
  return { subdomain, writer };
}
