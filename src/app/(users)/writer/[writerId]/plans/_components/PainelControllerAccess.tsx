'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect, useRef, useState } from "react";

type Tier = "FREE" | "SUBSCRIPTION" | "PAID_PATRON";

type Access = {
  quote: Tier;
  devotional: Tier;
  verse: Tier;
  prayer: Tier;
  biblePlan: Tier;
};

const DEFAULT_ACCESS: Access = {
  quote: "FREE",
  devotional: "FREE",
  verse: "FREE",
  prayer: "FREE",
  biblePlan: "FREE",
};

const TIER_LABEL: Record<Tier, string> = {
  FREE: "Grátis (leitor logado)",
  SUBSCRIPTION: "Só com assinatura",
  PAID_PATRON: "Assinatura ou compra no escritor",
};

function coerceAccess(raw: unknown): Partial<Access> {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const tier = (v: unknown): Tier | undefined =>
    v === "FREE" || v === "SUBSCRIPTION" || v === "PAID_PATRON" ? v : undefined;
  const fromBool = (b: unknown): Tier | undefined =>
    typeof b === "boolean" ? (b ? "FREE" : "SUBSCRIPTION") : undefined;

  return {
    quote: tier(o.quote) ?? fromBool(o.quote),
    devotional: tier(o.devotional) ?? fromBool(o.devotional),
    verse: tier(o.verse) ?? fromBool(o.verse),
    prayer: tier(o.prayer) ?? fromBool(o.prayer),
    biblePlan: tier(o.biblePlan) ?? fromBool(o.biblePlan),
  };
}

export const PainelControllerAccess = ({ writerId }: { writerId: string }) => {
  const [data, setData] = useState<Access>(DEFAULT_ACCESS);
  const [loading, setLoading] = useState(true);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resp = await fetch(`/api/writer/${writerId}/access`);
        const result = coerceAccess(await resp.json());
        setData(prev => ({ ...prev, ...result }));
      } catch (err) {
        console.error("Error fetching access data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [writerId]);

  const save = useCallback(async (next: Access) => {
    try {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      await fetch(`/api/writer/${writerId}/access`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
        signal: ctrl.signal,
      });
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        console.error("Error updating access data:", err);
      }
    }
  }, [writerId]);

  const handleTier = useCallback(
    (name: keyof Access) => (value: string) => {
      const tier = value as Tier;
      setData(prev => {
        const next = { ...prev, [name]: tier };
        void save(next);
        return next;
      });
    },
    [save]
  );

  const options: { name: keyof Access; label: string }[] = [
    { name: "quote", label: "Citação" },
    { name: "devotional", label: "Devocional" },
    { name: "verse", label: "Versículo" },
    { name: "prayer", label: "Oração" },
    { name: "biblePlan", label: "Plano Bíblico" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-8 mt-8">
      <h2 className="text-2xl font-semibold mb-2 text-gray-800">
        Acesso do Leitor
      </h2>
      <p className="text-gray-600 mb-6">
        Defina como cada tipo de conteúdo diário é liberado. Nos ebooks, use &quot;Acesso do leitor&quot; na
        publicação: grátis, venda avulsa ou somente assinantes (preço 0).
      </p>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <span className="text-gray-500">Carregando...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {options.map(opt => (
            <div
              key={opt.name}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-3 rounded-lg bg-gray-50"
            >
              <span className="text-base text-gray-800 font-medium">{opt.label}</span>
              <Select
                value={data[opt.name]}
                onValueChange={handleTier(opt.name)}
              >
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIER_LABEL) as Tier[]).map(t => (
                    <SelectItem key={t} value={t}>
                      {TIER_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
