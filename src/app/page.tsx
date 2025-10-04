import { Header } from "@/components/Header";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Home() {
  const h = headers();
  const host = (await h).get("host") ?? ""; // ex.: sub.example.com:3000
  const hostname = host.split(":")[0];

  // Configure no .env — ex.: proposito24h.com.br
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "example.com";

  const isLocalhost = hostname.endsWith("localhost") || hostname.endsWith("lvh.me");

  // Resolve subdomínio
  const subdomain = (() => {
    if (isLocalhost) {
      // ex.: escritor.localhost
      const parts = hostname.split(".");
      return parts.length > 1 ? parts[0] : "";
    }
    if (hostname === baseDomain || hostname === `www.${baseDomain}`) return "";
    return hostname.replace(`.${baseDomain}`, "");
  })();

  const isTenantSite = subdomain && subdomain !== "www";

  // Busca writer só quando é subdomínio do escritor
  const writer = isTenantSite
    ? await db.writer.findFirst({
        where: { domains: { some: { subdomain } } },
        select: {
          id: true,
          name: true,
          logoUrl: true,
          colorPrimary: true,
          colorSecondary: true,
        },
      })
    : null;

  // 404 se subdomínio inválido
  if (isTenantSite && !writer) {
    notFound();
  }

  const logo = writer?.logoUrl || "/AppImages/ios/512.png";
  const title = isTenantSite ? writer!.name : "DevotionalApp";

  // Cores de marca (opcional: pode aplicar em CSS vars / style inline)
  const primary = writer?.colorPrimary || "#0ea5e9"; // fallback sky-500
  const ink = writer?.colorSecondary || "#111827";   // fallback gray-900

  return (
    <section>
      <Header logo={logo} name={title} />

      <section className="absolute top-0 left-0 -z-10 w-full min-h-screen flex items-center justify-center flex-col gap-4">
        <video autoPlay muted loop className="absolute w-full h-full object-cover">
          <source src="/video/man-woman.mp4" type="video/mp4" />
        </video>
        <div className="bg-black absolute top-0 left-0 w-full h-full opacity-70" />

        <div className="z-10 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-white md:text-4xl text-2xl font-bold">
            {isTenantSite ? (
              <>Bem-vindo ao <b>{title}</b></>
            ) : (
              <>Seja bem-vindo ao <b>{title}</b></>
            )}
          </h1>

          <p className="text-white/90 md:text-lg mt-2 max-w-2xl">
            {isTenantSite
              ? "Mensagens, devocionais e leituras deste escritor."
              : "Onde você vai criar mais conexão com Deus!"}
          </p>

          {/* CTAs */}
          {isTenantSite ? (
            // Site do escritor: foco no leitor. Sem “Sou escritor / Começar”.
            <div className="flex gap-3 flex-col md:flex-row items-center justify-center mt-5">
              <Link
                href="/reader/area"
                className="px-8 py-2 rounded-md font-semibold"
                style={{ backgroundColor: primary, color: "#0b0f17" }}
              >
                Ler agora
              </Link>
              <Link
                href="/login"
                className="px-8 py-2 rounded-md font-semibold bg-white/90 text-black hover:bg-white"
              >
                Entrar
              </Link>
            </div>
          ) : (
            // Root/www: funil para escritores
            <div className="flex gap-3 flex-col md:flex-row items-center justify-center mt-5">
              <Link
                href="/register-writer"
                className="px-8 py-2 rounded-md font-semibold text-black"
                style={{ backgroundColor: primary }}
              >
                Sou escritor — Começar
              </Link>
              <Link
                href="/login"
                className="px-8 py-2 rounded-md font-semibold bg-white text-black"
              >
                Entrar
              </Link>
            </div>
          )}

          {/* Badge informativa (opcional) */}
          {isTenantSite && (
            <span className="mt-4 inline-block text-xs px-3 py-1 rounded-full bg-white/10 text-white/80">
              Espaço de <b style={{ color: primary }}>{writer!.name}</b>
            </span>
          )}
        </div>
      </section>
    </section>
  );
}
