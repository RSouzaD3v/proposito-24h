"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  BookHeart,
  BookOpen,
  CalendarDays,
  Check,
  Copy,
  CreditCard,
  FileSpreadsheet,
  HandHeart,
  Home,
  Layers,
  Library,
  LineChart,
  LogOut,
  Menu,
  Palette,
  PenLine,
  Plus,
  Quote,
  Radar,
  ScrollText,
  Settings,
  Store,
  UserRound,
  Users2,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Ativo no próprio href e em tudo abaixo dele, exceto nos prefixos de `exclude` (que têm item próprio). */
type NavItem = { href: string; label: string; icon: LucideIcon; exclude?: string[] };
type NavGroup = { title?: string; items: NavItem[] };

export type StudioWriter = {
  id: string | null;
  name: string;
  email: string;
  slug: string | null;
  logoUrl: string | null;
};

function groupsFor(writerId: string | null): NavGroup[] {
  return [
    { items: [{ href: "/writer/dashboard", label: "Início", icon: Home }] },
    {
      title: "Conteúdo diário",
      items: [
        { href: "/writer/daily/devotional", label: "Devocionais", icon: BookHeart },
        { href: "/writer/daily/verse", label: "Versículos", icon: ScrollText },
        { href: "/writer/daily/quote", label: "Frases", icon: Quote },
        { href: "/writer/daily/prayer", label: "Orações", icon: HandHeart },
        { href: "/writer/daily/management", label: "Calendário", icon: CalendarDays },
        { href: "/writer/group-daily", label: "Jornadas", icon: Layers },
        { href: "/writer/imports", label: "Importar planilha", icon: FileSpreadsheet },
      ],
    },
    {
      title: "Livros",
      items: [
        { href: "/writer/publications", label: "Publicações", icon: Library, exclude: ["/writer/publications/my-vitrine"] },
        { href: "/writer/publications/my-vitrine", label: "Ver como leitor", icon: Store },
      ],
    },
    {
      title: "Insights",
      items: [
        {
          href: "/writer/analytics",
          label: "Visão geral",
          icon: LineChart,
          exclude: ["/writer/analytics/audience", "/writer/analytics/readers"],
        },
        { href: "/writer/analytics/audience", label: "Audiência", icon: Radar },
        { href: "/writer/analytics/readers", label: "Leitores", icon: Users2 },
      ],
    },
    {
      title: "Sua plataforma",
      items: [
        { href: "/writer/profile", label: "Perfil e marca", icon: UserRound },
        { href: "/writer/personalization", label: "Personalização", icon: Palette },
        ...(writerId ? [{ href: `/writer/${writerId}/plans`, label: "Planos para leitores", icon: CreditCard }] : []),
      ],
    },
    {
      title: "Conta",
      items: [
        { href: "/writer/payments", label: "Recebimentos", icon: Wallet },
        { href: "/writer/settings", label: "Configurações", icon: Settings },
      ],
    },
  ];
}

const CREATE = [
  { href: "/writer/daily/devotional/new", label: "Devocional", icon: BookHeart },
  { href: "/writer/daily/verse/new", label: "Versículo", icon: ScrollText },
  { href: "/writer/daily/quote/new", label: "Frase", icon: Quote },
  { href: "/writer/daily/prayer/new", label: "Oração", icon: HandHeart },
];

function isActive(pathname: string, item: NavItem) {
  if (pathname !== item.href && !pathname.startsWith(`${item.href}/`)) return false;
  return !(item.exclude ?? []).some((prefix) => pathname.startsWith(prefix));
}

export function StudioSidebar({ writer }: { writer: StudioWriter }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const groups = groupsFor(writer.id);
  const current = groups.flatMap((group) => group.items).find((item) => isActive(pathname, item));
  const close = () => setOpen(false);

  const Brand = () => (
    <div className="flex items-center gap-3 px-5 pb-5 pt-6">
      {writer.logoUrl ? (
        <img src={writer.logoUrl} alt="" className="size-9 shrink-0 rounded-lg border border-[var(--admin-line)] bg-white object-contain" />
      ) : (
        <span className="admin-display grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--liquid-ink)] text-base text-white">
          {writer.name.charAt(0).toUpperCase() || "E"}
        </span>
      )}
      <Link href="/writer/dashboard" className="min-w-0 leading-none" onClick={close}>
        <span className="admin-display block truncate text-[1.1rem] text-[var(--liquid-ink)]">{writer.name || "Seu estúdio"}</span>
        <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--liquid-muted)]">
          Estúdio do escritor
        </span>
      </Link>
    </div>
  );

  const CreateMenu = () => (
    <div className="px-3 pb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-9 w-full justify-center gap-2 bg-[var(--liquid-ink)] text-[13px] text-white hover:bg-[#35312a]">
            <Plus className="size-4" aria-hidden /> Criar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs font-medium text-[var(--liquid-muted)]">Conteúdo diário</DropdownMenuLabel>
          {CREATE.map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href} onClick={close}>
                <Icon className="size-4" aria-hidden /> {label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/writer/publications/create" onClick={close}>
              <BookOpen className="size-4" aria-hidden /> Livro
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/writer/group-daily" onClick={close}>
              <Layers className="size-4" aria-hidden /> Jornada
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const Nav = () => (
    <nav className="grid gap-5" aria-label="Seções do estúdio">
      {groups.map((group, index) => (
        <div key={group.title ?? index}>
          {group.title && <p className="mb-1 px-3 text-[11px] font-medium text-[var(--liquid-muted)]">{group.title}</p>}
          <ul className="grid gap-px">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-md px-3 py-[6px] text-[13.5px] transition-colors",
                      active
                        ? "bg-[var(--admin-surface)] font-semibold text-[var(--liquid-ink)] shadow-[0_0_0_1px_var(--admin-line)]"
                        : "font-medium text-[#4a463f] hover:bg-[var(--studio-rail-hover)] hover:text-[var(--liquid-ink)]",
                    )}
                  >
                    {active && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[var(--liquid-accent)]" aria-hidden />}
                    <Icon className={cn("size-4 shrink-0", active ? "text-[var(--liquid-accent)]" : "text-[#8a8378]")} aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const Footer = () => (
    <div className="grid gap-2 border-t border-[var(--admin-line)] p-3">
      {writer.slug && <ShareLink slug={writer.slug} />}
      <div className="flex items-center gap-3 px-2 py-1">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e3ddd1] text-[13px] font-semibold text-[var(--liquid-ink)]">
          {writer.name.charAt(0).toUpperCase() || "E"}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-medium text-[var(--liquid-ink)]">{writer.name}</span>
          <span className="block truncate text-xs text-[var(--liquid-muted)]">{writer.email}</span>
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-md text-[var(--liquid-muted)] hover:bg-[#f6e2dd] hover:text-[var(--admin-bad)]"
          onClick={() => setConfirmLogout(true)}
          aria-label="Sair"
          title="Sair"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </div>
  );

  const Rail = () => (
    <>
      <Brand />
      <CreateMenu />
      <ScrollArea className="min-h-0 flex-1 px-3 pb-4">
        <Nav />
      </ScrollArea>
      <Footer />
    </>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen border-r border-[var(--admin-line)] bg-[var(--studio-rail)] md:flex md:flex-col">
        <Rail />
      </aside>

      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--admin-line)] bg-[var(--studio-rail)]/95 px-3 py-2 backdrop-blur md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-md" aria-label="Abrir menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="studio-shell flex w-[284px] flex-col gap-0 border-[var(--admin-line)] bg-[var(--studio-rail)] p-0">
            <SheetTitle className="sr-only">Menu do estúdio</SheetTitle>
            <Rail />
          </SheetContent>
        </Sheet>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--liquid-ink)]">{current?.label ?? "Estúdio"}</span>
        <Button asChild size="sm" className="h-8 gap-1.5 bg-[var(--liquid-ink)] text-white">
          <Link href="/writer/daily/devotional/new">
            <PenLine className="size-3.5" aria-hidden /> Escrever
          </Link>
        </Button>
      </div>

      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sair do estúdio?</DialogTitle>
            <DialogDescription>Você precisará entrar novamente para escrever e acompanhar seus leitores.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="size-4" /> Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "devotionalapp.com.br";

/** Link de cadastro dos leitores, sempre à mão para compartilhar. */
function ShareLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://${slug}.${baseDomain}/reader/register`;

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex w-full items-center gap-2.5 rounded-md border border-[var(--admin-line)] bg-[var(--admin-surface)] px-3 py-2 text-left transition-colors hover:border-[#d3cbbd]"
      title={url}
    >
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[12.5px] font-semibold text-[var(--liquid-ink)]">
          {copied ? "Link copiado" : "Convidar leitores"}
        </span>
        <span className="block truncate text-[11px] text-[var(--liquid-muted)]">
          {slug}.{baseDomain}
        </span>
      </span>
      {copied ? (
        <Check className="size-4 shrink-0 text-[var(--admin-good)]" aria-hidden />
      ) : (
        <Copy className="size-4 shrink-0 text-[var(--liquid-muted)] group-hover:text-[var(--liquid-ink)]" aria-hidden />
      )}
    </button>
  );
}
