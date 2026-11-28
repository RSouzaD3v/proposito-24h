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
  HeartPulse,
  ListChecks,
  LogOut,
  Menu,
  Paintbrush,
  Smartphone,
  UserRound,
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
      { href: "/admin/engagement", label: "Engajamento", icon: HeartPulse },
      { href: "/admin/analytics", label: "Receita", icon: BarChart3 },
    ],
  },
  {
    title: "Pessoas e finanças",
    items: [
      { href: "/admin/readers", label: "Leitores", icon: UserRound },
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
      { href: "/admin/widget", label: "Widget", icon: Smartphone },
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
    <div className="px-5 pb-6 pt-6">
      <Link href="/admin" className="block leading-none" onClick={() => setOpen(false)}>
        <span className="admin-display block text-[1.35rem] text-[var(--liquid-ink)]">Propósito24h</span>
        <span className="mt-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--liquid-muted)]">
          Administração
        </span>
      </Link>
    </div>
  );

  const Nav = () => (
    <nav className="grid gap-6" aria-label="Seções do admin">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-3 text-[11px] font-medium text-[var(--liquid-muted)]">{group.title}</p>
          <ul className="grid gap-px">
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
                      "relative flex items-center gap-2.5 rounded-md px-3 py-[7px] text-[13.5px] transition-colors",
                      active
                        ? "bg-[var(--admin-surface)] font-semibold text-[var(--liquid-ink)] shadow-[0_0_0_1px_var(--admin-line)]"
                        : "font-medium text-[#4a463f] hover:bg-[#ebe7df] hover:text-[var(--liquid-ink)]",
                    )}
                  >
                    {active && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[var(--liquid-accent)]" aria-hidden />}
                    <Icon className={cn("size-4", active ? "text-[var(--liquid-accent)]" : "text-[#8a8378]")} aria-hidden />
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
    <div className="flex items-center gap-3 px-2 py-1.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e3ddd1] text-[13px] font-semibold text-[var(--liquid-ink)]">
        {userName.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[13px] font-medium text-[var(--liquid-ink)]">{userName}</span>
        <span className="block truncate text-xs text-[var(--liquid-muted)]">{userEmail}</span>
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
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen border-r border-[var(--admin-line)] bg-[#f0ede6] md:flex md:flex-col">
        <Brand />
        <ScrollArea className="min-h-0 flex-1 px-3 pb-4">
          <Nav />
        </ScrollArea>
        <div className="border-t border-[var(--admin-line)] p-3">
          <Account />
        </div>
      </aside>

      {/* Mobile */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--admin-line)] bg-[#f0ede6]/95 px-3 py-2 backdrop-blur md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-md" aria-label="Abrir menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="admin-shell flex w-[280px] flex-col gap-0 border-[var(--admin-line)] bg-[#f0ede6] p-0">
            <SheetTitle className="sr-only">Menu do admin</SheetTitle>
            <Brand />
            <ScrollArea className="min-h-0 flex-1 px-3 pb-4">
              <Nav />
            </ScrollArea>
            <div className="border-t border-[var(--admin-line)] p-3">
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
