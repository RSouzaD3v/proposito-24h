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
    <nav className="grid gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
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
      {/* ajuste a rota da sua assinatura/checkout do escritor */}
      <Link href="/writer/dashboard" onClick={() => setOpen(false)}>
        <Button className="w-full gap-2" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Painel
        </Button>
      </Link>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:bg-background">
        <div className="px-4 py-4 text-base font-semibold">Analytics</div>
        <ScrollArea className="flex-1 px-2 pb-6"><Nav /></ScrollArea>
        <div className="border-t p-3"><FooterButtons /></div>
      </aside>

      {/* Mobile */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="p-2">
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="h-4 w-4" /> Menu
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="left" className="p-0">
            <div className="px-4 py-4 text-base font-semibold">Analytics</div>
            <ScrollArea className="h-[calc(100vh-64px-72px)] px-2"><Nav /></ScrollArea>
            <div className="border-t p-3"><FooterButtons /></div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
