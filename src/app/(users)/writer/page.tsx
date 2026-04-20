"use client";

import Link from "next/link";

export default function WriterLanding() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] gap-4 p-6 text-center">
      <p className="text-neutral-600 max-w-md">
        Os pagamentos dos seus leitores e das suas vendas são processados pela plataforma via Asaas. Não é necessário
        conectar conta de terceiros.
      </p>
      <Link
        href="/writer/subscription"
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Assinatura do escritor (plataforma)
      </Link>
    </div>
  );
}
