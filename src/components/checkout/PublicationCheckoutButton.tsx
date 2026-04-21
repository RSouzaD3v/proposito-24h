"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  publicationId: string;
  className?: string;
};

function formatCpfHint(digits: string) {
  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function PublicationCheckoutButton({ publicationId, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/billing", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { cpfCnpj?: string | null };
        if (data.cpfCnpj && !cancelled) {
          setCpfCnpj(formatCpfHint(data.cpfCnpj));
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleBuy() {
    try {
      setLoading(true);
      const res = await fetch(`/api/checkout/publication/${publicationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpfCnpj }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Falha ao iniciar checkout");
      const url = (data as { url?: string }).url;
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Não foi possível iniciar o pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <div className="space-y-1">
        <Label htmlFor={`cpf-${publicationId}`}>CPF ou CNPJ</Label>
        <Input
          id={`cpf-${publicationId}`}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Obrigatório para o Asaas"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Usamos para emitir cobranças com segurança. Você pode salvar no perfil após a primeira compra.
        </p>
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={handleBuy}
        className={className ?? "px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"}
      >
        {loading ? "Redirecionando..." : "Comprar"}
      </button>
    </div>
  );
}
