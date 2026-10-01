import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Logout from "../_components/Logout";
import { ClipboardLink } from "./_components/ClipboardLink";
import { WriterShell } from "@/components/ui/writer-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { NavTile } from "@/components/ui/nav-tile";
import {
  BookOpen,
  FolderOpen,
  Library,
  LineChart,
  Palette,
  Settings,
  Sparkles,
} from "lucide-react";

export default async function WriterDashboardPage() {
  const session = await getServerSession(authOptions);

  const itemsNav = [
    { id: 1, title: "Diário", href: "/writer/daily", icon: <BookOpen className="size-6" /> },
    { id: 7, title: "Diários Agrupamento", href: "/writer/group-daily", icon: <FolderOpen className="size-6" /> },
    { id: 2, title: "Minhas Publicações", href: "/writer/publications", icon: <Library className="size-6" /> },
    { id: 3, title: "Meus Insights", href: "/writer/analytics", icon: <LineChart className="size-6" /> },
    { id: 4, title: "Configurações", href: "/writer/settings", icon: <Settings className="size-6" /> },
    { id: 5, title: "Mais Recursos", href: "/writer/profile", icon: <Sparkles className="size-6" /> },
    { id: 6, title: "Personalização cliente", href: "/writer/personalization", icon: <Palette className="size-6" /> },
  ];

  if (!session?.user || session.user.role !== "WRITER_ADMIN") {
    redirect("/login");
  }

  const writerId = session.user.writerId!;
  const writer = await db.writer.findUnique({
    where: { id: writerId },
  });

  return (
    <WriterShell maxWidth="4xl">
      <div className="mb-10 flex items-center gap-5 animate-glass-in">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5b9cff] to-[#2b6de5] text-2xl font-bold text-white shadow-[0_8px_24px_rgb(43_109_229_/_0.35),inset_0_1px_0_rgb(255_255_255_/_0.4)]">
          {session.user.name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-4xl">
            Bem-vindo, {session.user.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--liquid-muted)]">Painel do escritor</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
        {itemsNav.map((item, index) => (
          <div
            key={item.id}
            className="animate-glass-in"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <NavTile href={item.href} title={item.title} icon={item.icon} />
          </div>
        ))}
        <Logout />
      </div>

      {writer?.slug && (
        <GlassCard
          strong
          padding="md"
          className="flex items-center gap-3 animate-glass-in"
          style={{ animationDelay: "280ms" }}
        >
          <ClipboardLink slug={writer.slug} />
        </GlassCard>
      )}
    </WriterShell>
  );
}
