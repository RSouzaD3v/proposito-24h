"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  BarChart3,
  Users2,
  Banknote,
  CreditCard,
  LogOut,
  Menu,
  Paintbrush,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils"; // se não tiver, troque por template strings

const NAV = [
  { href: "/admin", label: "Visão geral", icon: LayoutGrid },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/writers", label: "Escritores", icon: Users2 },
  { href: "/admin/payouts", label: "Repasses", icon: Banknote },
  { href: "/admin/writer-subscriptions", label: "Assinaturas (Escritores)", icon: CreditCard },
  { href: "/admin/personalization", label: "Personalização", icon: Paintbrush },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavItems = () => (
    <nav className="grid gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
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

  const CheckoutAndLogout = () => (
    <div className="grid gap-2">
      {/* Logout com next-auth */}
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
        <div className="px-4 py-4 text-base font-semibold">Admin</div>

        {/* navegação rolável */}
        <ScrollArea className="flex-1 px-2 pb-6">
          <NavItems />
        </ScrollArea>

        {/* footer fixo com os botões */}
        <div className="border-t p-3">
          <CheckoutAndLogout />
        </div>
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
            <div className="px-4 py-4 text-base font-semibold">Admin</div>

            <ScrollArea className="h-[calc(100vh-64px-72px)] px-2">
              {/* 64px header, 72px footer botão area approx */}
              <NavItems />
            </ScrollArea>

            {/* footer com botões no mobile */}
            <div className="border-t p-3">
              <CheckoutAndLogout />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
