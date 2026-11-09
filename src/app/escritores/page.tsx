import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Header } from "@/components/Header";
import { apiPublicGet } from "@/lib/api/server";
import { DirectoryFilters } from "./_components/DirectoryFilters";
import { WriterGrid } from "./_components/WriterGrid";
import { plural, type DirectoryList } from "./_lib/directory";

type SearchParams = {
  busca?: string;
  ordem?: string;
  entrou?: string;
  conteudo?: string;
  ativos?: string;
  pagina?: string;
};

const SORT_PARAM: Record<string, string> = {
  recentes: "newest",
  antigos: "oldest",
  atualizados: "updated",
  nome: "name",
};
const CONTENT_PARAM: Record<string, string> = { livros: "books", diario: "daily" };

const hasFilters = (params: SearchParams) =>
  Boolean(params.busca || params.ordem || params.entrou || params.conteudo || params.ativos);

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const title = "Escritores cristãos | DevotionalApp";
  const description =
    "Conheça escritores cristãos, veja os livros e devocionais de cada um e crie sua conta com quem você quer acompanhar.";
  return {
    title,
    description,
    alternates: { canonical: "/escritores" },
    robots: hasFilters(await searchParams) ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: "/escritores", siteName: "DevotionalApp", locale: "pt_BR", type: "website" },
  };
}

function pageHref(params: SearchParams, page: number) {
  const next = new URLSearchParams(
    Object.entries({ ...params, pagina: page > 1 ? String(page) : "" }).filter(([, value]) => value) as [string, string][],
  );
  const query = next.toString();
  return `/escritores${query ? `?${query}` : ""}`;
}

export default async function EscritoresPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);
  const query = new URLSearchParams({ page: String(page) });
  const filters: Record<string, string | undefined> = {
    search: params.busca?.trim(),
    sort: params.ordem ? SORT_PARAM[params.ordem] : undefined,
    joined: params.entrou,
    content: params.conteudo ? CONTENT_PARAM[params.conteudo] : undefined,
    active: params.ativos,
  };
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);

  const list = await apiPublicGet<DirectoryList>(`/public/directory/writers?${query}`, 60);
  const writers = list?.items ?? [];
  const total = list?.total ?? 0;
  const totalPages = list ? Math.ceil(total / list.pageSize) : 1;

  return (
    <div className="reader-premium relative min-h-screen bg-[var(--reader-bg)] text-[var(--liquid-ink)]">
      <Header logo="/AppImages/ios/192.png" name="DevotionalApp" showPlatformLinks />

      <section className="reader-scene reader-scene-night">
        <div className="mx-auto max-w-6xl px-5 pt-28 pb-8 sm:px-8">
          <h1 className="text-4xl leading-tight sm:text-5xl">Escolha seu escritor</h1>
          <p className="mt-3 flex items-start gap-2 text-[15px] leading-snug text-white/85">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            Sua conta fica vinculada a um único escritor e, por enquanto, essa escolha é vitalícia.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-9">
        <DirectoryFilters />

        <p className="mt-6 mb-4 text-[13px] text-[var(--liquid-muted)]" aria-live="polite">
          {plural(total, "escritor encontrado", "escritores encontrados")}
          {!params.ordem && total > 1 && " · A ordem muda todo dia para dar a mesma chance a todos"}
        </p>

        {writers.length > 0 ? (
          <WriterGrid writers={writers} />
        ) : (
          <p className="rounded-2xl border border-dashed border-[var(--input)] p-10 text-center text-[15px] text-[var(--liquid-muted)]">
            Nenhum escritor encontrado com esses filtros.
          </p>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-between text-sm font-semibold" aria-label="Paginação">
            {page > 1 ? <Link href={pageHref(params, page - 1)}>← Anterior</Link> : <span />}
            <span className="font-normal text-[var(--liquid-muted)]">
              Página {page.toLocaleString("pt-BR")} de {totalPages.toLocaleString("pt-BR")}
            </span>
            {page < totalPages ? <Link href={pageHref(params, page + 1)}>Próxima →</Link> : <span />}
          </nav>
        )}
      </main>
    </div>
  );
}
