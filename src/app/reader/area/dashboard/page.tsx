import React from "react";
import PentateucoProgress from "./_components/Pentateuco";
import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";

export default async function DashboardPage() {
  return (
    <div className="p-6">
        <Link href={"/reader/area"} className="bg-gray-600 text-white p-2 rounded-sm flex items-center gap-2 w-fit">
            <FiChevronLeft size={20}/>
            <span>Voltar</span>
        </Link>
      <h1 className="text-2xl font-bold my-5">Dashboard Bíblico</h1>
      <Link href={"/reader/area/reading/plan/365"} className="text-sm bg-blue-600 text-white shadow px-3 py-1 rounded-full w-fit font-semibold hover:bg-blue-700 transition">
        Ir para o Plano de Leitura Bíblia em 365 Dias
      </Link>

        <h2 className="mt-10 font-bold text-xl">Velho Testamento</h2>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
            <PentateucoProgress />
        </div>
    </div>
  );
}
