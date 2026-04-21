import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronRight, CreditCard, Settings, UserRound } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="min-h-[calc(100dvh-2rem)] bg-linear-to-b from-muted/50 via-background to-background">
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Button variant="outline" size="icon" className="shrink-0" asChild>
              <Link href="/reader/area" aria-label="Voltar para a área do leitor">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Minha conta</h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Dados do perfil e atalhos para a sua experiência no app.
              </p>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary ring-2 ring-primary/20"
                  aria-hidden
                >
                  {label}
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-xl font-semibold leading-tight">
                    {user.name?.trim() || "Leitor"}
                  </CardTitle>
                  <CardDescription className="truncate text-base">{user.email}</CardDescription>
                  <p className="text-muted-foreground text-xs">Membro desde {memberSince}</p>
                </div>
              </div>
              {user.freePlan ? (
                <Badge variant="secondary" className="w-fit shrink-0">
                  Plano gratuito
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/30 p-4">
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
          </CardContent>
        </Card>

        <div>
          <h2 className="text-muted-foreground mb-3 text-sm font-medium uppercase tracking-wide">
            Atalhos
          </h2>
          <div className="grid gap-3 sm:grid-cols-1">
            {links.map(({ href, title, description, icon: Icon }) => (
              <Link key={href} href={href} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Card className="h-full border-border/60 transition-colors group-hover:border-primary/30 group-hover:bg-accent/30">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0 py-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="text-base font-medium">{title}</CardTitle>
                      <CardDescription className="text-sm">{description}</CardDescription>
                    </div>
                    <ChevronRight className="text-muted-foreground size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Card className="border-border/40 bg-muted/20">
          <CardFooter className="flex flex-col items-stretch gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Precisa sair desta conta neste dispositivo? Use o botão de sair nas configurações.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/reader/area/settings">Abrir configurações</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
