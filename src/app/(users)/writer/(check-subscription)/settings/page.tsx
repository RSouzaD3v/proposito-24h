import Link from "next/link";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { Plans } from "./_components/Plans";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-indigo-200 p-6">
        <section className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center gap-6 border border-indigo-100">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-1 tracking-tight">Configurações</h1>
          <p className="text-indigo-500 text-center mb-2 text-sm">
            Você precisa estar logado para acessar as configurações.
          </p>
          <Link href={"/login"}>
            <span className="inline-block px-6 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-base font-semibold shadow">
              Ir para Login
            </span>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-indigo-200 p-6">
      <section className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center gap-6 border border-indigo-100">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-1 tracking-tight">Configurações</h1>
        <p className="text-indigo-500 text-center mb-2 text-sm">
          Gerencie sua assinatura e preferências da conta. Pagamentos de leitores e vendas são processados pela
          plataforma via Asaas (conta única).
        </p>
        <div className="w-full flex flex-col items-center gap-3 mb-4">
          <Plans />
        </div>
        <Link href={"/writer/dashboard"}>
          <span className="inline-block px-6 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-base font-semibold shadow">
            Ir para o Painel
          </span>
        </Link>
      </section>
    </main>
  );
}
