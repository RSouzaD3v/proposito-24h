"use client";

import { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatCpfCnpj,
  isValidCpfCnpj,
  paymentErrorMessage,
  type BillingProfile,
} from "@/components/subscriptions/billing";

type Props = {
  publicationId: string;
  className?: string;
};

export function PublicationCheckoutButton({ publicationId, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState("");
  // Até o perfil responder, o documento é pedido; o provedor do escritor decide se é obrigatório.
  const [requiresTaxId, setRequiresTaxId] = useState(true);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/v1/billing/profile", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as Partial<BillingProfile>;
        if (cancelled) return;
        if (data.cpfCnpj) setCpfCnpj(formatCpfCnpj(data.cpfCnpj));
        setRequiresTaxId(data.requiresTaxId !== false);
      } catch {
        /* sem perfil, o campo continua visível */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const documentValid = !requiresTaxId || isValidCpfCnpj(cpfCnpj);

  async function handleBuy() {
    setTouched(true);
    if (!documentValid) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/billing/publications/${publicationId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requiresTaxId ? { cpfCnpj } : {}),
      });
      const data = await res.json().catch(() => ({}));
      const url = (data as { url?: string }).url;
      if (!res.ok || !url) throw new Error(paymentErrorMessage(data, "Não foi possível iniciar o pagamento."));
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível iniciar o pagamento.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      {requiresTaxId && (
        <div className="space-y-1">
          <Label htmlFor={`cpf-${publicationId}`}>CPF ou CNPJ</Label>
          <Input
            id={`cpf-${publicationId}`}
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
            onBlur={() => setTouched(true)}
            aria-invalid={touched && !documentValid}
          />
          <p className={touched && !documentValid ? "text-xs text-red-700 dark:text-red-300" : "text-xs text-muted-foreground"}>
            {touched && !documentValid
              ? "Confira o número: o CPF tem 11 dígitos e o CNPJ, 14."
              : "Exigido para emitir a cobrança. Fica salvo para as próximas compras."}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-700 dark:text-red-300">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
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
