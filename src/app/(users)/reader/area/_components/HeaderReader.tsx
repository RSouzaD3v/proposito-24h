"use client";

import Link from "next/link";
import { useAuth } from "../_contexts/AuthContext";

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
      style={{ backgroundColor: colors.independenteColor1 }}
      className="
        fixed top-0 left-0 z-50 w-full
        flex items-center justify-center
        md:gap-10 gap-5 p-4
        shadow rounded-b-[50px]
      "
    >
      <Link
        href="/reader/area/settings"
        style={{
          backgroundColor: colors.buttonBg,
          color: colors.buttonText,
        }}
        className="
          md:w-17.5 w-11.25 md:h-17.5 h-11.25
          flex items-center justify-center
          rounded-full font-bold
          md:text-2xl text-xl
          hover:scale-105 transition-all duration-300
        "
      >
        <span>{firstLetter}</span>
      </Link>

      <div>
        <h1 className="md:text-3xl text-lg text-white font-bold">
          Olá, {firstName}
        </h1>

        <p className="text-white md:text-lg text-sm">
          {titleHeader || "Vamos passar um tempo com Deus?"}
        </p>
      </div>
    </header>
  );
};
