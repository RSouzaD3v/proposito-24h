"use client";
import Link from "next/link";
import { useAuth } from "../_contexts/AuthContext";

export const HeaderReader = ({ titleHeader }: { titleHeader?: string }) => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 z-50 w-full flex items-center justify-center md:gap-10 gap-5 p-4 bg-[#202020] shadow rounded-b-[50px]">
      <Link href="/reader/area/settings" className="md:w-[70px] w-[45px] h-[45px] hover:scale-105 transition-all ease-in-out duration-300 md:text-2xl text-xl md:h-[70px] flex items-center justify-center 
      bg-gradient-to-l from-blue-400 to-propositoBlue text-white font-bold rounded-full p-2">
        <h2>{user ? user?.name.charAt(0).toLocaleUpperCase() : "?"}</h2>
      </Link>

      <div>
        <h1 className="md:text-3xl text-lg text-white font-bold">Olá, {user?.name.split(' ')[0] || "Usuário"}</h1>
        <p className="text-white md:text-lg text-sm">{titleHeader}</p>
      </div>
    </header>
  );
};
