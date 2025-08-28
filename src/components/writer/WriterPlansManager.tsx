"use client";

import { useEffect, useState } from "react";

type Plan = {
  id: string;
  stripeProductId: string;
  stripePriceId: string;
  interval: "DAY" | "WEEK" | "MONTH" | "YEAR";
  amountCents: number;
  currency: string;
  trialDays: number;
  applicationFeePct: number | null;
  isActive: boolean;
  createdAt: string;
};

function cents(n: number, c = "BRL") {
  try { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: c }).format(n / 100); }
  catch { return `R$ ${(n/100).toFixed(2)}`; }
}

export default function WriterPlansManager({ writerId }: { writerId: string }) {
  const [items, setItems] = useState<Plan[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amountCents: 1990,
    currency: "BRL",
    interval: "MONTH",
    trialDays: 0,
    applicationFeePct: 0,
  });

  const load = async () => {
    const res = await fetch(`/api/writer/${writerId}/plans`, { cache: "no-store" });
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  const createPlan = async () => {
    try {
      setBusy(true);
      const res = await fetch(`/api/writer/${writerId}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao criar plano");
      setForm({ ...form });
      await load();
      alert("Plano criado!");
    } catch (e: any) {
      alert(e?.message || "Falha ao criar plano");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/writer/${writerId}/plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) alert("Erro ao alternar plano");
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-xl p-4 space-y-3">
        <h3 className="font-semibold">Criar novo plano</h3>
        <div className="grid grid-cols-2 gap-3">
          <input className="border p-2 rounded" placeholder="Nome (opcional)"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <select className="border p-2 rounded" value={form.interval}
            onChange={e => setForm(f => ({ ...f, interval: e.target.value as any }))}>
            <option value="DAY">Diário</option>
            <option value="WEEK">Semanal</option>
            <option value="MONTH">Mensal</option>
            <option value="YEAR">Anual</option>
          </select>
          <input className="border p-2 rounded" type="number" min={100}
            value={form.amountCents}
            onChange={e => setForm(f => ({ ...f, amountCents: Number(e.target.value) }))} />
          <input className="border p-2 rounded" value={form.currency}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value.toUpperCase() }))} />
          <input className="border p-2 rounded" type="number" min={0} placeholder="trialDays"
            value={form.trialDays}
            onChange={e => setForm(f => ({ ...f, trialDays: Number(e.target.value) }))} />
          <input className="border p-2 rounded" type="number" min={0} step={0.1}
            value={form.applicationFeePct}
            onChange={e => setForm(f => ({ ...f, applicationFeePct: Number(e.target.value) }))} />
        </div>
        <button disabled={busy} onClick={createPlan}
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60">
          {busy ? "Criando..." : "Criar plano"}
        </button>
      </div>

      <div className="border rounded-xl p-4">
        <h3 className="font-semibold mb-3">Planos existentes</h3>
        {!items.length && <div>Nenhum plano ainda.</div>}
        {!!items.length && (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Preço</th>
                  <th className="p-2">Intervalo</th>
                  <th className="p-2">Trial</th>
                  <th className="p-2">Fee (%)</th>
                  <th className="p-2">Ativo</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">{cents(p.amountCents, p.currency)}</td>
                    <td className="p-2">{p.interval}</td>
                    <td className="p-2">{p.trialDays || 0}</td>
                    <td className="p-2">{p.applicationFeePct ?? "—"}</td>
                    <td className="p-2">{p.isActive ? "Sim" : "Não"}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-neutral-200 hover:bg-neutral-300"
                        onClick={() => toggle(p.id, !p.isActive)}
                      >
                        {p.isActive ? "Desativar" : "Ativar"}
                      </button>
                      {/* Sugestão: botão para abrir modal de edição -> chama PUT */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
