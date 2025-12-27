"use client";
import { Gamepad } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTree } from "react-icons/fa";
import { FiHeart, FiBook, FiCheck } from "react-icons/fi";

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

  // Fallback seguro (nunca quebra)
  const safeColors = {
    primary: colors?.primary || "#202020",
    secondary: colors?.secondary || "#404040",
    background: colors?.background || "#ffffff",
    buttonBg: colors?.buttonBg || "#22c55e",
    buttonText: colors?.buttonText || "#ffffff",
    text: colors?.text || "#000000",
  };

  const itemsNav = [
    {
      id: 1,
      name: "Hoje",
      icon: <FiCheck size={22} />,
      link: "/reader/area",
    },
    {
      id: 3,
      name: "Bíblia",
      icon: <FiBook size={22} />,
      link: "/reader/area/bible-nvi",
    },
    {
      id: 4,
      name: "Minha Jornada",
      icon: <FaTree size={22} />,
      link: "/reader/area/journey",
    },
    {
      id: 5,
      name: "Game",
      icon: <Gamepad size={22} />,
      link: "/reader/area/game",
    },
    {
      id: 6,
      name: "Quiz",
      icon: <Gamepad size={22} />,
      link: "/reader/area/quiz",
    },
  ];

  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 shadow-2xl rounded-full px-6 py-3 z-50 backdrop-blur-md border transition-all bg-white/50"
    >
      <ul className="flex items-center md:gap-6 gap-3">
        {itemsNav.map((item) => {
          const isActive = pathname === item.link;

          return (
            <Link
              key={item.id}
              href={item.link}
              className="flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-150"
              style={{
                background: isActive
                  ? `linear-gradient(180deg, ${safeColors.primary}, ${safeColors.secondary})`
                  : "transparent",
                color: isActive ? safeColors.buttonText : safeColors.text,
                transform: isActive ? "scale(1.1)" : "scale(1)",
                boxShadow: isActive
                  ? `0 4px 15px ${safeColors.primary}40`
                  : "none",
              }}
            >
              <span className="mb-1">{item.icon}</span>
              <span className="text-xs md:block hidden font-semibold">
                {item.name}
              </span>
            </Link>
          );
        })}
      </ul>
    </nav>
  );
};
