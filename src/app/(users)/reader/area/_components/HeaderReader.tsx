"use client";

import Link from "next/link";
import { useAuth } from "../_contexts/AuthContext";
import { cn } from "@/lib/utils";

interface HeaderReaderProps {
  titleHeader?: string | null;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    buttonBg: string;
    buttonText: string;
    text: string;
    independenteColor1: string;
    independenteColor2: string;
  };
}

export const HeaderReader = ({
  titleHeader,
  colors,
}: HeaderReaderProps) => {
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] || "Usuário";
  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <header
      style={{
        background: `linear-gradient(135deg, ${colors.independenteColor1}ee, ${colors.independenteColor2 || colors.independenteColor1}cc)`,
      }}
      className={cn(
        "fixed top-0 left-0 z-50 w-full",
        "flex items-center justify-center gap-5 p-4 md:gap-10",
        "rounded-b-[2rem] border-b border-white/30",
        "shadow-[0_8px_32px_rgb(15_40_80_/_0.12)]",
        "backdrop-blur-xl"
      )}
    >
      <Link
        href="/reader/area/settings"
        style={{
          backgroundColor: colors.buttonBg,
          color: colors.buttonText,
        }}
        className={cn(
          "flex size-11 items-center justify-center rounded-full font-bold text-xl md:size-[4.375rem] md:text-2xl",
          "border border-white/40 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.35)]",
          "transition-transform duration-300 hover:scale-105"
        )}
      >
        <span>{firstLetter}</span>
      </Link>

      <div>
        <h1 className="text-lg font-bold tracking-tight text-white md:text-3xl">
          Olá, {firstName}
        </h1>
        <p className="text-sm text-white/90 md:text-lg">
          {titleHeader || "Vamos passar um tempo com Deus?"}
        </p>
      </div>
    </header>
  );
};
