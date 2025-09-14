// app/admin/_components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  BarChart3,
  Users2,
  Banknote,
  Menu,
  CreditCard
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils"; // se não tiver, troque por template strings

const NAV = [
  { href: "/admin", label: "Visão geral", icon: LayoutGrid },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/writers", label: "Escritores", icon: Users2 },
  { href: "/admin/payouts", label: "Repasses", icon: Banknote },
  { href: "/admin/writer-subscriptions", label: "Assinaturas (Escritores)", icon: CreditCard },
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

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:bg-background">
        <div className="px-4 py-4 text-base font-semibold">Admin</div>
        <ScrollArea className="h-[calc(100vh-64px)] px-2 pb-6">
          <NavItems />
        </ScrollArea>
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
            <ScrollArea className="h-[calc(100vh-64px)] px-2 pb-6">
              <NavItems />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
