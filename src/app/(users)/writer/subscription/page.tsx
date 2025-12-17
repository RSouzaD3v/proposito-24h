"use client";

import { useState } from "react";

export default function WriterSubscriptionPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);

    const res = await fetch("/api/stripe/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        writerId: "WRITER_ID_AQUI", // ⚡ em prod: pegar da session (NextAuth)
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erro: " + data.error);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Assinatura da Plataforma</h1>
      <p className="text-gray-600 mb-6">
        Ative sua assinatura para manter seu espaço white-label ativo.
      </p>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Processando..." : "Ativar Assinatura"}
      </button>
    </main>
  );
}
