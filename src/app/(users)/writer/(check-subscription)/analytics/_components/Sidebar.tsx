"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3, Users2, LogOut, Menu,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/writer/analytics", label: "Overview", icon: BarChart3 },
  { href: "/writer/analytics/readers", label: "Leitores", icon: Users2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const Nav = () => (
    <nav className="grid gap-1.5">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-[var(--liquid-accent)]/90 text-white shadow-sm"
                  : "text-[var(--liquid-ink)] hover:bg-white/50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );

  const FooterButtons = () => (
    <div className="grid gap-2">
      <Link href="/writer/dashboard" onClick={() => setOpen(false)}>
        <Button variant="glass" className="w-full gap-2 rounded-full" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Painel
        </Button>
      </Link>
      <Button
        variant="glass"
        size="sm"
        className="w-full gap-2 rounded-full text-red-700 hover:bg-red-50/70"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </div>
  );

  return (
    <>
      <aside className="glass-surface-strong hidden md:flex md:w-[260px] md:flex-col md:rounded-none md:border-y-0 md:border-l-0">
        <div className="px-4 py-5 text-base font-semibold tracking-tight text-[var(--liquid-ink)]">
          Analytics
        </div>
        <ScrollArea className="flex-1 px-2 pb-6"><Nav /></ScrollArea>
        <div className="border-t border-white/40 p-3"><FooterButtons /></div>
      </aside>

      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="p-2">
            <SheetTrigger asChild>
              <Button variant="glass" size="sm" className="gap-2 rounded-full">
                <Menu className="h-4 w-4" /> Menu
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="left" className="border-white/40 bg-white/80 p-0 backdrop-blur-xl">
            <div className="px-4 py-4 text-base font-semibold text-[var(--liquid-ink)]">
              Analytics
            </div>
            <ScrollArea className="h-[calc(100vh-64px-72px)] px-2"><Nav /></ScrollArea>
            <div className="border-t border-white/40 p-3"><FooterButtons /></div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
