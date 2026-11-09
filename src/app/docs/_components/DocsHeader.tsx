"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const TABS = [
  { href: "/docs/leitor", label: "Leitor" },
  { href: "/docs/escritor", label: "Escritor" },
];

export function DocsHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--liquid-muted)] transition-colors hover:text-[var(--liquid-ink)]"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Início
          </Link>
          <span className="h-5 w-px shrink-0 bg-[var(--border)]" aria-hidden />
          <Link href="/docs" className="flex min-w-0 items-center gap-2">
            <Image src="/AppImages/ios/192.png" alt="" width={32} height={32} className="hidden size-8 rounded-lg sm:block" />
            <span className="truncate text-sm font-bold">Ajuda</span>
          </Link>
        </div>
        <nav aria-label="Tipo de usuário" className="flex rounded-xl bg-[var(--muted)] p-1 text-sm font-semibold">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3.5 py-1.5 transition-colors ${
                  active ? "bg-[var(--reader-surface)] shadow-sm" : "text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
