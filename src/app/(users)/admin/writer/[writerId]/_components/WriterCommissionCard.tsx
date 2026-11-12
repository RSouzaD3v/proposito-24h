"use client";

import { useEffect, useState } from "react";
import { Check, CircleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { formatBps, percentToBps } from "@/components/subscriptions/writer-offer";

/** Mesmo teto da API (MAX_COMMISSION_BPS). */
const MAX_COMMISSION_PCT = 50;

/** Comissão específica do escritor; vazio volta a usar a comissão padrão da plataforma. */
export function WriterCommissionCard({
  writerId,
  initialBps,
}: {
  writerId: string;
  /** Comissão salva do escritor (null = usa o padrão); undefined quando a API não informou. */
  initialBps?: number | null;
}) {
  const [defaultBps, setDefaultBps] = useState<number | null>(null);
  const [current, setCurrent] = useState<number | null | undefined>(initialBps);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/billing/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (typeof data?.settings?.defaultCommissionBps === "number") setDefaultBps(data.settings.defaultCommissionBps);
      })
      .catch(() => undefined);
  }, []);

  const save = async (commissionBps: number | null) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/admin/billing/writers/${encodeURIComponent(writerId)}/commission`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionBps }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const text = Array.isArray(data?.message) ? data.message[0] : data?.message;
        throw new Error(text || "Não foi possível salvar a comissão.");
      }
      const saved = (data as { commissionBps: number | null }).commissionBps;
      setCurrent(saved);
      setValue("");
      setMessage({
        ok: true,
        text: saved === null ? "Este escritor voltou a usar a comissão padrão." : `Comissão definida em ${formatBps(saved)}.`,
      });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Não foi possível salvar a comissão." });
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const bps = percentToBps(value);
    if (bps === null || bps < 0 || bps > MAX_COMMISSION_PCT * 100) {
      setMessage({ ok: false, text: `Informe uma comissão entre 0% e ${MAX_COMMISSION_PCT}%.` });
      return;
    }
    void save(bps);
  };

  const defaultLabel = defaultBps !== null ? formatBps(defaultBps) : "padrão";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comissão da plataforma</CardTitle>
        <CardDescription>
          Retida de cada venda deste escritor aos leitores. Padrão da plataforma: {defaultLabel}.
          {current !== undefined &&
            (current === null ? " Este escritor usa o padrão." : ` Este escritor usa ${formatBps(current)}.`)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="writer-commission">Comissão específica (%)</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="writer-commission"
                inputMode="decimal"
                placeholder={defaultBps !== null ? `Padrão: ${defaultLabel}` : "Ex.: 10"}
                className="max-w-40"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <Button type="submit" disabled={busy || !value.trim()}>
                {busy && <ButtonSpinner />}
                Salvar
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => save(null)}>
                Usar padrão
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Vale para as próximas vendas. Entre 0% e {MAX_COMMISSION_PCT}%.</p>
          </div>
          {message && (
            <p
              role={message.ok ? "status" : "alert"}
              className={
                message.ok
                  ? "flex items-center gap-2 text-sm font-medium text-emerald-700"
                  : "flex items-center gap-2 text-sm font-medium text-red-700"
              }
            >
              {message.ok ? <Check className="size-4" aria-hidden /> : <CircleAlert className="size-4" aria-hidden />}
              {message.text}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
