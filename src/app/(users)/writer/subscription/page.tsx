"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WriterSubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/billing", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { cpfCnpj?: string | null };
        if (data.cpfCnpj && !cancelled) setCpfCnpj(data.cpfCnpj);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubscribe() {
    setLoading(true);

    const res = await fetch("/api/asaas/writer-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpfCnpj }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erro: " + (data.error || "resposta inválida"));
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-2xl font-bold mb-4">Assinatura da Plataforma</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Ative sua assinatura para manter seu espaço white-label ativo. Pagamento processado via Asaas.
        Período de teste e primeira cobrança seguem a configuração da conta (variável{" "}
        <code className="text-sm bg-gray-100 px-1 rounded">ASAAS_WRITER_TRIAL_DAYS</code>, padrão 7 dias).
      </p>
      <div className="w-full max-w-sm text-left space-y-2 mb-6">
        <Label htmlFor="writer-cpf">CPF ou CNPJ</Label>
        <Input
          id="writer-cpf"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(e.target.value)}
          placeholder="Obrigatório para o Asaas"
        />
      </div>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Processando..." : "Ativar Assinatura"}
      </button>
    </main>
  );
}
