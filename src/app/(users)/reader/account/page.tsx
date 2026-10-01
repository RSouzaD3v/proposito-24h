import Link from "next/link";
import { BookOpen, ChevronRight, CreditCard, Settings, UserRound } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

function initials(name: string | null | undefined, email: string) {
  const n = (name || "").trim();
  if (n.length >= 2) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default async function ReaderAccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/sign-in?from=/reader/account");

  const user = await db.user.findFirst({
    where: { id: session.user.id, role: Role.CLIENT },
    select: {
      name: true,
      email: true,
      createdAt: true,
      freePlan: true,
      writer: {
        select: { name: true, slug: true },
      },
    },
  });

  if (!user) redirect("/sign-in?from=/reader/account");

  const label = initials(user.name, user.email);
  const memberSince = new Date(user.createdAt).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const links = [
    {
      href: "/reader/area",
      title: "Área do leitor",
      description: "Devocionais, leitura e conteúdo do dia.",
      icon: BookOpen,
    },
    {
      href: "/reader/area/settings",
      title: "Configurações",
      description: "Senha, tema e planos do app.",
      icon: Settings,
    },
    {
      href: "/reader/area/subscription",
      title: "Minhas assinaturas",
      description: "Renovação, cancelamento e status.",
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-8">
        <BackButton href="/reader/area" className="mb-2" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--liquid-ink)] md:text-3xl">
            Minha conta
          </h1>
          <p className="mt-1 text-sm text-[var(--liquid-muted)] md:text-base">
            Dados do perfil e atalhos para a sua experiência no app.
          </p>
        </div>

        <GlassCard strong padding="none" className="overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary ring-2 ring-primary/20"
                  aria-hidden
                >
                  {label}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xl font-semibold leading-tight text-[var(--liquid-ink)]">
                    {user.name?.trim() || "Leitor"}
                  </p>
                  <p className="truncate text-base text-[var(--liquid-muted)]">{user.email}</p>
                  <p className="text-xs text-[var(--liquid-muted)]">Membro desde {memberSince}</p>
                </div>
              </div>
              {user.freePlan ? (
                <Badge variant="secondary" className="w-fit shrink-0">
                  Plano gratuito
                </Badge>
              ) : null}
            </div>
          </div>
          <Separator />
          <div className="p-6 pt-6">
            <div className="flex items-start gap-3 rounded-lg border border-dashed border-[var(--liquid-border)] bg-white/20 p-4">
              <UserRound className="text-muted-foreground mt-0.5 size-5 shrink-0" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">Escritor vinculado</p>
                <p className="text-muted-foreground text-sm">
                  {user.writer?.name ?? "—"}
                  {user.writer?.slug ? (
                    <>
                      {" "}
                      <span className="text-muted-foreground/80">·</span>{" "}
                      <Link
                        href={`/reader/area/w/${user.writer.slug}`}
                        className="text-primary font-medium underline-offset-4 hover:underline"
                      >
                        Ver vitrine
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        <div>
          <h2 className="text-muted-foreground mb-3 text-sm font-medium uppercase tracking-wide">
            Atalhos
          </h2>
          <div className="grid gap-3 sm:grid-cols-1">
            {links.map(({ href, title, description, icon: Icon }) => (
              <Link key={href} href={href} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <GlassCard padding="sm" interactive className="flex flex-row items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-base font-medium text-[var(--liquid-ink)]">{title}</p>
                      <p className="text-sm text-[var(--liquid-muted)]">{description}</p>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-[var(--liquid-muted)] transition-transform group-hover:translate-x-0.5" />
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>

        <GlassCard padding="sm" className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--liquid-muted)]">
              Precisa sair desta conta neste dispositivo? Use o botão de sair nas configurações.
            </p>
            <Button variant="glass" size="sm" asChild>
              <Link href="/reader/area/settings">Abrir configurações</Link>
            </Button>
        </GlassCard>
    </div>
  );
}
