"use client";
import Link from "next/link";
import { useAuth } from "../_contexts/AuthContext";

export const HeaderReader = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 z-50 w-full flex items-center justify-center md:gap-10 gap-5 p-4 bg-gray-100 shadow rounded-b-[50px]">
      <Link href="/reader/area/settings" className="md:w-[70px] w-[45px] h-[45px] hover:scale-105 transition-all ease-in-out duration-300 text-2xl md:h-[70px] flex items-center justify-center 
      bg-gradient-to-l from-blue-500 to-blue-600 text-white font-bold rounded-full p-2">
        <h2>{user ? user?.name.charAt(0).toLocaleUpperCase() : "?"}</h2>
      </Link>

      <div>
        <h1 className="md:text-3xl text-xl font-bold">Olá, {user?.name || "Usuário"}</h1>
        <p>Vamos passar tempo com Deus?</p>
      </div>
    </header>
  );
};
