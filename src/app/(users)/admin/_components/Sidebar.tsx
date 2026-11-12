"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  BarChart3,
  Banknote,
  CreditCard,
  Gamepad2,
  LayoutGrid,
  ListChecks,
  LogOut,
  Menu,
  Paintbrush,
  ShieldCheck,
  Users2,
  Wallet,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof LayoutGrid; match?: string[] };

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Painel",
    items: [
      { href: "/admin", label: "Visão geral", icon: LayoutGrid },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Pessoas e finanças",
    items: [
      { href: "/admin/writers", label: "Escritores", icon: Users2, match: ["/admin/writer/"] },
      { href: "/admin/writer-subscriptions", label: "Planos dos escritores", icon: CreditCard },
      { href: "/admin/billing", label: "Pagamentos", icon: Wallet },
      { href: "/admin/payouts", label: "Repasses", icon: Banknote },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { href: "/admin/personalization", label: "Personalização", icon: Paintbrush },
      { href: "/admin/game", label: "Game", icon: Gamepad2 },
      { href: "/admin/quiz", label: "Quiz", icon: ListChecks },
    ],
  },
];

function isActive(pathname: string, item: NavItem) {
  if (item.href === "/admin") return pathname === "/admin";
  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`) ||
    (item.match ?? []).some((prefix) => pathname.startsWith(prefix))
  );
}

export default function Sidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const current = GROUPS.flatMap((group) => group.items).find((item) => isActive(pathname, item));

  const Brand = () => (
    <div className="flex items-center gap-3 px-4 py-5">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b9cff] to-[#2b6de5] text-white shadow-[0_6px_18px_rgb(43_109_229_/_0.35),inset_0_1px_0_rgb(255_255_255_/_0.4)]">
        <ShieldCheck className="size-5" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight text-[var(--liquid-ink)]">Proposito24h</span>
        <span className="block text-xs text-[var(--liquid-muted)]">Painel administrativo</span>
      </span>
    </div>
  );

  const Nav = () => (
    <nav className="grid gap-5" aria-label="Seções do admin">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--liquid-muted)]/80">
            {group.title}
          </p>
          <ul className="grid gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-[var(--liquid-accent)] text-white shadow-[0_6px_16px_rgb(43_109_229_/_0.28)]"
                        : "text-[var(--liquid-ink)] hover:bg-white/60",
                    )}
                  >
                    <Icon className={cn("size-4", !active && "text-[var(--liquid-muted)]")} aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const Account = () => (
    <div className="flex items-center gap-3 rounded-2xl bg-white/50 p-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--liquid-ink)] text-sm font-semibold text-white">
        {userName.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-medium text-[var(--liquid-ink)]">{userName}</span>
        <span className="block truncate text-xs text-[var(--liquid-muted)]">{userEmail}</span>
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 rounded-full text-[var(--liquid-muted)] hover:bg-red-50 hover:text-red-700"
        onClick={() => setConfirmLogout(true)}
        aria-label="Sair"
        title="Sair"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="glass-surface-strong sticky top-0 hidden h-screen md:flex md:flex-col md:rounded-none md:border-y-0 md:border-l-0">
        <Brand />
        <ScrollArea className="min-h-0 flex-1 px-3 pb-4">
          <Nav />
        </ScrollArea>
        <div className="border-t border-white/50 p-3">
          <Account />
        </div>
      </aside>

      {/* Mobile */}
      <div className="glass-surface-strong sticky top-0 z-30 flex items-center gap-3 rounded-none border-x-0 border-t-0 px-3 py-2 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="glass" size="icon" className="rounded-full" aria-label="Abrir menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[280px] flex-col gap-0 border-white/40 bg-white/85 p-0 backdrop-blur-xl">
            <SheetTitle className="sr-only">Menu do admin</SheetTitle>
            <Brand />
            <ScrollArea className="min-h-0 flex-1 px-3 pb-4">
              <Nav />
            </ScrollArea>
            <div className="border-t border-white/50 p-3">
              <Account />
            </div>
          </SheetContent>
        </Sheet>
        <span className="truncate text-sm font-semibold text-[var(--liquid-ink)]">{current?.label ?? "Admin"}</span>
      </div>

      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sair do painel?</DialogTitle>
            <DialogDescription>Você precisará entrar novamente para acessar a área administrativa.</DialogDescription>
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
