"use client";
import Link from "next/link";
import { useAuth } from "../_contexts/AuthContext";

export const HeaderReader = ({ titleHeader, colors }: { titleHeader?: string; colors: { primary: string; secondary: string; background: string; 
  buttonBg: string; buttonText: string; text: string; independenteColor1: string; independenteColor2: string } }) => {
  const { user } = useAuth();

  return (
    <header style={{ backgroundColor: colors.independenteColor1 }} className="fixed top-0 left-0 z-50 w-full flex items-center justify-center md:gap-10 gap-5 p-4 bg-[#202020] shadow rounded-b-[50px]">
      <Link style={{
        backgroundColor: colors.buttonBg,
        color: colors.buttonText
      }} href="/reader/area/settings" className="md:w-[70px] w-[45px] h-[45px] hover:scale-105 transition-all ease-in-out duration-300 md:text-2xl text-xl md:h-[70px] flex items-center justify-center 
      bg-gradient-to-l  text-white font-bold rounded-full p-2">
        <h2>{user ? user?.name.charAt(0).toLocaleUpperCase() : "?"}</h2>
      </Link>

      <div>
        <h1 className="md:text-3xl text-lg text-white font-bold">Olá, {user?.name.split(' ')[0] || "Usuário"}</h1>
        <p className="text-white md:text-lg text-sm">{titleHeader}</p>
      </div>
    </header>
  );
};
