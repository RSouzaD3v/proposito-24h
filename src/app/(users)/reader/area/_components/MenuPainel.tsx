"use client";
import { Gamepad } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTree } from "react-icons/fa";
import { FiBook, FiCheck } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface MenuPainelProps {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    buttonBg?: string;
    buttonText?: string;
    text?: string;
  };
}

export const MenuPainel = ({ colors }: MenuPainelProps) => {
  const pathname = usePathname();

  const safeColors = {
    primary: colors?.primary || "#2b6de5",
    secondary: colors?.secondary || "#5b9cff",
    background: colors?.background || "#ffffff",
    buttonBg: colors?.buttonBg || "#2b6de5",
    buttonText: colors?.buttonText || "#ffffff",
    text: colors?.text || "#1a2b4a",
  };

  const itemsNav = [
    {
      id: 1,
      name: "Hoje",
      icon: <FiCheck size={22} />,
      link: "/reader/area",
      match: (path: string) => path === "/reader/area",
    },
    {
      id: 3,
      name: "Bíblia",
      icon: <FiBook size={22} />,
      link: "/reader/area/bible-nvi",
      match: (path: string) =>
        path.startsWith("/reader/area/bible-nvi") ||
        path.startsWith("/reader/area/bible-acf"),
    },
    {
      id: 4,
      name: "Minha Jornada",
      icon: <FaTree size={22} />,
      link: "/reader/area/journey",
      match: (path: string) => path.startsWith("/reader/area/journey"),
    },
    {
      id: 5,
      name: "Games",
      icon: <Gamepad size={22} />,
      link: "/reader/area/games",
      match: (path: string) =>
        path.startsWith("/reader/area/games") ||
        path.startsWith("/reader/area/quiz") ||
        path.startsWith("/reader/area/word-connect"),
    },
  ];

  return (
    <nav
      className={cn(
        "glass-surface-strong fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        "max-w-[calc(100vw-1.5rem)] rounded-full border border-white/65 px-3 py-2 sm:px-5 md:px-6",
        "shadow-[0_8px_32px_rgb(15_40_80_/_0.14)]"
      )}
    >
      <ul className="flex items-center justify-center gap-1 sm:gap-2 md:gap-5">
        {itemsNav.map((item) => {
          const isActive = item.match(pathname);

          return (
            <Link
              key={item.id}
              href={item.link}
              className="flex shrink-0 flex-col items-center justify-center rounded-2xl px-2 py-1.5 transition-all duration-200 sm:px-3"
              style={{
                background: isActive
                  ? `linear-gradient(180deg, ${safeColors.primary}, ${safeColors.secondary})`
                  : "transparent",
                color: isActive ? safeColors.buttonText : safeColors.text,
                boxShadow: isActive
                  ? `0 4px 16px ${safeColors.primary}40`
                  : "none",
              }}
            >
              <span className="mb-0.5">{item.icon}</span>
              <span className="hidden text-xs font-semibold md:block">
                {item.name}
              </span>
            </Link>
          );
        })}
      </ul>
    </nav>
  );
};
