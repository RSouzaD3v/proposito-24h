"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Gamepad2, NotebookPen, Sprout, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { name: "Hoje", icon: Sun, link: "/reader/area", match: (path: string) => path === "/reader/area" },
  {
    name: "Bíblia",
    icon: BookOpen,
    link: "/reader/area/bible-nvi",
    match: (path: string) => path.startsWith("/reader/area/bible-"),
  },
  {
    name: "Caderno",
    icon: NotebookPen,
    link: "/reader/area/prayer-journal",
    match: (path: string) => path.startsWith("/reader/area/prayer-journal"),
  },
  {
    name: "Jornada",
    icon: Sprout,
    link: "/reader/area/journey",
    match: (path: string) => path.startsWith("/reader/area/journey"),
  },
  {
    name: "Games",
    icon: Gamepad2,
    link: "/reader/area/games",
    match: (path: string) =>
      ["games", "quiz", "word-connect"].some((route) => path.startsWith(`/reader/area/${route}`)),
  },
];

export const MenuPainel = () => {
  const pathname = usePathname();

  return (
    <nav
      data-reader-chrome
      aria-label="Navegação principal"
      className="fixed bottom-5 left-1/2 z-50 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 rounded-full border border-[var(--glass-border)] bg-[var(--reader-nav)] p-1.5 shadow-[0_14px_40px_-12px_rgb(30_20_10_/_0.4)] backdrop-blur-xl"
    >
      <ul className="flex items-center gap-0.5">
        {ITEMS.map(({ name, icon: Icon, link, match }) => {
          const active = match(pathname);
          return (
            <li key={name}>
              <Link
                href={link}
                aria-label={name}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center justify-center gap-2 rounded-full px-3.5 text-xs font-bold transition-colors duration-200 md:px-4",
                  active
                    ? "bg-[var(--liquid-accent)] text-[var(--liquid-on-accent)]"
                    : "text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]",
                )}
              >
                <Icon className="size-5" />
                <span className={active ? "inline" : "hidden md:inline"}>{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
