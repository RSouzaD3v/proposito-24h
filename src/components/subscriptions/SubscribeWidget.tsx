"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import SubscribeButton from "./SubscribeButton";
import ManageSubscription from "./ManageSubscription";

type Plan = {
  id: string;
  stripePriceId: string;
  interval: "DAY" | "WEEK" | "MONTH" | "YEAR";
  amountCents: number;
  currency: string;
  trialDays: number;
  applicationFeePct: number | null;
  isActive: boolean;
};

type StatusResp = {
  exists: boolean;
  isActive: boolean;
  status: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  latestInvoiceId?: string | null;
  stripeSubscriptionId?: string | null;
};

function centsToMoney(cents: number, currency = "BRL") {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100);
  } catch {
    return `R$ ${(cents / 100).toFixed(2)}`;
  }
}

async function readJsonSafe(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}. Esperado JSON, recebido: ${text.slice(0, 140)}`);
  }
  return res.json();
}

export default function SubscribeWidget({
  writerId,
  successUrl,
  cancelUrl,
}: {
  writerId: string;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [status, setStatus] = useState<StatusResp | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauth, setUnauth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setError(null);
        const pRes = await fetch(`/api/writer/${writerId}/plans`, { cache: "no-store" });
        const sRes = await fetch(`/api/reader-subscriptions/${writerId}/status`, { cache: "no-store" });

        if (!pRes.ok) throw new Error(`Falha ao carregar planos (HTTP ${pRes.status})`);
        const p = await readJsonSafe(pRes);

        if (sRes.status === 401) {
          setUnauth(true);
          setStatus({ exists: false, isActive: false, status: null });
        } else if (sRes.ok) {
          const s = await readJsonSafe(sRes);
          setStatus(s);
        } else {
          const text = await sRes.text();
          throw new Error(`Falha ao carregar status (HTTP ${sRes.status}): ${text.slice(0, 140)}`);
        }

        if (!mounted) return;
        setPlans(Array.isArray(p) ? p : []);
        setSelected(Array.isArray(p) && p[0]?.id ? p[0].id : null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Erro ao carregar dados da assinatura.");
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [writerId]);

  const active = status?.isActive;
  const selectedPlan = useMemo(
    () => plans.find(pl => pl.id === selected) ?? null,
    [plans, selected]
  );

  const doSignIn = () => {
    // volta para a página atual após login
    const callbackUrl = typeof window !== "undefined" ? window.location.href : "/";
    signIn(undefined, { callbackUrl });
  };

  if (loading) return <div className="p-4 border rounded-xl">Carregando...</div>;

  if (error) {
    return (
      <div className="p-4 border rounded-xl text-sm">
        <div className="font-medium mb-2">Não foi possível carregar as informações.</div>
        <pre className="text-xs whitespace-pre-wrap bg-neutral-100 p-2 rounded">{error}</pre>
      </div>
    );
  }

  // Não logado → CTA de login (mantém planos visíveis)
  if (unauth) {
    return (
      <div className="border rounded-xl p-4 flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Assine este escritor</h3>

        {!plans.length && <div>Nenhum plano disponível para este escritor.</div>}

        {!!plans.length && (
          <>
            <div className="grid gap-3">
              {plans.map((pl) => (
                <label
                  key={pl.id}
                  className={`border rounded-lg p-3 flex items-center justify-between cursor-pointer ${selected === pl.id ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => setSelected(pl.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {centsToMoney(pl.amountCents, pl.currency)} / {pl.interval === "MONTH" ? "mês" : pl.interval.toLowerCase()}
                    </span>
                    {pl.trialDays ? (
                      <span className="text-xs text-neutral-600">{pl.trialDays} dias de teste</span>
                    ) : null}
                  </div>
                  <input type="radio" name="plan" checked={selected === pl.id} onChange={() => setSelected(pl.id)} />
                </label>
              ))}
            </div>

            <button
              onClick={doSignIn}
              className="self-end px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Entrar para assinar
            </button>
          </>
        )}
      </div>
    );
  }

  // Já assinante
  if (active && status) {
    return (
      <ManageSubscription
        writerId={writerId}
        status={status.status}
        cancelAtPeriodEnd={status.cancelAtPeriodEnd}
        currentPeriodEnd={status.currentPeriodEnd ?? null}
      />
    );
  }

  // Logado e não assinante
  if (!plans.length) {
    return <div className="p-4 border rounded-xl">Nenhum plano disponível para este escritor.</div>;
  }

  return (
    <div className="border rounded-xl p-4 flex flex-col gap-4">
      <div className="grid gap-3">
        {plans.map((pl) => (
          <label
            key={pl.id}
            className={`border rounded-lg p-3 flex items-center justify-between cursor-pointer ${selected === pl.id ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setSelected(pl.id)}
          >
            <div className="flex flex-col">
              <span className="text-sm">
                {centsToMoney(pl.amountCents, pl.currency)} / {pl.interval === "MONTH" ? "mês" : pl.interval.toLowerCase()}
              </span>
              {pl.trialDays ? (
                <span className="text-xs text-neutral-600">{pl.trialDays} dias de teste</span>
              ) : null}
            </div>
            <input type="radio" name="plan" checked={selected === pl.id} onChange={() => setSelected(pl.id)} />
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        {selectedPlan ? (
          <SubscribeButton
            writerId={writerId}
            planId={selectedPlan.id}
            successUrl={successUrl}
            cancelUrl={cancelUrl}
          >
            Assinar {centsToMoney(selectedPlan.amountCents, selectedPlan.currency)}
          </SubscribeButton>
        ) : (
          <button disabled className="px-4 py-2 rounded bg-blue-600 text-white opacity-60">
            Selecione um plano
          </button>
        )}
      </div>
    </div>
  );
}
