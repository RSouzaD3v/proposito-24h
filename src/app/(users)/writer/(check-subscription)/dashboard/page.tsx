import { apiGetOrNull } from "@/lib/api/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import Link from "next/link";
import { redirect } from "next/navigation";
import Logout from "../_components/Logout";
import { ClipboardLink } from "./_components/ClipboardLink";
import { deltaOf, BRL, INT, type Insights } from "../analytics/_lib/insights";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { NavTile } from "@/components/ui/nav-tile";
import { WriterShell } from "@/components/ui/writer-shell";
import { KpiTile } from "@/components/writer/KpiTile";
import { PublicationStatusBadge } from "@/components/writer/PublicationStatusBadge";
import {
  BookOpen,
  Eye,
  FolderOpen,
  Library,
  LineChart,
  Palette,
  PenLine,
  Plus,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";

const ITEMS_NAV = [
  { title: "Diário", href: "/writer/daily", icon: <BookOpen className="size-6" /> },
  { title: "Diários Agrupamento", href: "/writer/group-daily", icon: <FolderOpen className="size-6" /> },
  { title: "Minhas Publicações", href: "/writer/publications", icon: <Library className="size-6" /> },
  { title: "Meus Insights", href: "/writer/analytics", icon: <LineChart className="size-6" /> },
  { title: "Recebimentos", href: "/writer/payments", icon: <Wallet className="size-6" /> },
  { title: "Configurações", href: "/writer/settings", icon: <Settings className="size-6" /> },
  { title: "Mais Recursos", href: "/writer/profile", icon: <Sparkles className="size-6" /> },
  { title: "Personalização cliente", href: "/writer/personalization", icon: <Palette className="size-6" /> },
];

const RECENT_BOOKS = 3;

export default async function WriterDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "WRITER_ADMIN") {
    redirect("/login");
  }

  const [writer, insights] = await Promise.all([
    apiGetOrNull<{ slug: string }>("/writer/profile"),
    apiGetOrNull<Insights>("/writer/analytics/insights?range=30d"),
  ]);
  const recentBooks = insights?.books.slice(0, RECENT_BOOKS) ?? [];

  return (
    <WriterShell maxWidth="5xl">
      <header className="mb-8 flex flex-wrap items-center gap-4 animate-glass-in">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5b9cff] to-[#2b6de5] text-xl font-bold text-white shadow-[0_8px_24px_rgb(43_109_229_/_0.35),inset_0_1px_0_rgb(255_255_255_/_0.4)]">
          {session.user.name?.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Olá, {session.user.name}</h1>
          <p className="text-sm text-[var(--liquid-muted)]">Seu ministério nos últimos 30 dias</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="glass" className="rounded-full px-4">
            <Link href="/writer/publications/my-vitrine"><Eye className="size-4" /> Ver como leitor</Link>
          </Button>
          <Button asChild variant="glass-primary" className="rounded-full px-4">
            <Link href="/writer/publications/create"><Plus className="size-4" /> Novo livro</Link>
          </Button>
        </div>
      </header>

      {insights && (
        <section aria-label="Resumo dos últimos 30 dias" className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiTile label="Receita líquida" value={BRL.format(insights.current.netCents / 100)} delta={deltaOf(insights.current.netCents, insights.previous.netCents)} />
          <KpiTile label="Novos assinantes" value={INT.format(insights.current.newSubs)} delta={deltaOf(insights.current.newSubs, insights.previous.newSubs)} />
          <KpiTile label="Leitores ativos" value={INT.format(insights.activeReaders)} hint="acessaram nos últimos 30 dias" />
          <KpiTile label="Leituras concluídas" value={INT.format(insights.current.completions)} delta={deltaOf(insights.current.completions, insights.previous.completions)} />
        </section>
      )}

      {recentBooks.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-[var(--liquid-ink)]">Continue escrevendo</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {recentBooks.map((book) => (
              <Link key={book.id} href={`/writer/publications/${book.slug}/chapters`} className="block">
                <GlassCard strong interactive padding="sm" className="flex h-full items-center gap-3">
                  <span className="relative block aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-md bg-slate-200">
                    {book.coverUrl && <img src={book.coverUrl} alt="" className="absolute inset-0 size-full object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-[var(--liquid-ink)]">{book.title}</span>
                    <span className="mt-0.5 block text-xs text-[var(--liquid-muted)]">
                      {INT.format(book.chapters)} {book.chapters === 1 ? "capítulo" : "capítulos"} · {INT.format(book.words)} palavras
                    </span>
                    <span className="mt-1 block"><PublicationStatusBadge status={book.status} /></span>
                  </span>
                  <PenLine className="size-4 shrink-0 text-[var(--liquid-muted)]" aria-hidden />
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
        {ITEMS_NAV.map((item, index) => (
          <div key={item.href} className="animate-glass-in" style={{ animationDelay: `${index * 40}ms` }}>
            <NavTile href={item.href} title={item.title} icon={item.icon} />
          </div>
        ))}
        <Logout />
      </div>

      {writer?.slug && (
        <GlassCard strong padding="md" className="flex items-center gap-3 animate-glass-in" style={{ animationDelay: "280ms" }}>
          <ClipboardLink slug={writer.slug} />
        </GlassCard>
      )}
    </WriterShell>
  );
}
