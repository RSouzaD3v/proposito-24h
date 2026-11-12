"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Banknote, ChevronRight, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cents, formatDate, INT, PAYOUT_STATUS } from "../../_lib/format";

export type Payout = {
  id: string;
  writerId: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  fees: number | null;
  netAmount: number;
  status: string;
  reference: string | null;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
  paidAt: string | null;
  writer: { name: string };
};

const FILTERS = [
  { key: "ALL", label: "Todos" },
  { key: "PENDING", label: "Pendentes" },
  { key: "PAID", label: "Pagos" },
  { key: "CANCELED", label: "Cancelados" },
] as const;

function StatusPill({ status }: { status: string }) {
  const meta = PAYOUT_STATUS[status] ?? { label: status, className: "bg-slate-100 text-slate-700" };
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", meta.className)}>{meta.label}</span>;
}

export function PayoutsTable({ payouts }: { payouts: Payout[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("ALL");
  const [selected, setSelected] = useState<Payout | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: payouts.length };
    for (const payout of payouts) map[payout.status] = (map[payout.status] ?? 0) + 1;
    return map;
  }, [payouts]);
  const visible = filter === "ALL" ? payouts : payouts.filter((payout) => payout.status === filter);

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 p-5 pb-3" role="tablist" aria-label="Filtrar por status">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              filter === key ? "bg-[var(--liquid-accent)] text-white shadow-sm" : "text-[var(--liquid-muted)] hover:bg-white/70",
            )}
          >
            {label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px] tabular-nums",
                filter === key ? "bg-white/25" : "bg-black/5",
              )}
            >
              {INT.format(counts[key] ?? 0)}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-sm">
          <thead>
            <tr className="border-y border-black/5 text-left text-xs text-[var(--liquid-muted)]">
              <th className="py-2 pl-5 pr-3 font-medium">Escritor</th>
              <th className="px-3 py-2 font-medium">Período</th>
              <th className="px-3 py-2 text-right font-medium">Bruto</th>
              <th className="px-3 py-2 text-right font-medium">Taxas</th>
              <th className="px-3 py-2 text-right font-medium">Líquido</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="w-10 pr-5" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {visible.map((payout) => (
              <tr
                key={payout.id}
                onClick={() => setSelected(payout)}
                className="group cursor-pointer border-b border-black/5 transition-colors last:border-0 hover:bg-white/55"
              >
                <td className="py-3 pl-5 pr-3 font-medium text-[var(--liquid-ink)]">
                  <button type="button" className="text-left hover:underline focus-visible:underline focus-visible:outline-none">
                    {payout.writer.name}
                  </button>
                </td>
                <td className="px-3 py-3 text-[var(--liquid-muted)]">
                  {formatDate(payout.periodStart)} – {formatDate(payout.periodEnd)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{cents(payout.grossAmount)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--liquid-muted)]">{cents(payout.fees)}</td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums">{cents(payout.netAmount)}</td>
                <td className="px-3 py-3"><StatusPill status={payout.status} /></td>
                <td className="pr-5">
                  <ChevronRight className="size-4 text-[var(--liquid-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-2xl bg-black/5 text-[var(--liquid-muted)]">
                    <Banknote className="size-5" aria-hidden />
                  </span>
                  <span className="text-[var(--liquid-muted)]">Nenhum repasse neste filtro.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6">Repasse para {selected.writer.name}</DialogTitle>
                <DialogDescription>
                  Período de {formatDate(selected.periodStart)} a {formatDate(selected.periodEnd)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs text-slate-500">Valor líquido</p>
                  <p className="text-2xl font-bold tabular-nums text-slate-900">{cents(selected.netAmount)}</p>
                </div>
                <StatusPill status={selected.status} />
              </div>

              <dl className="grid gap-2 text-sm">
                <Row label="Bruto" value={cents(selected.grossAmount)} />
                <Row label="Taxas" value={`− ${cents(selected.fees)}`} />
                <div className="my-1 border-t" />
                <Row label="Criado em" value={formatDate(selected.createdAt)} />
                <Row label="Pago em" value={selected.paidAt ? formatDate(selected.paidAt) : "—"} />
                <Row label="Referência" value={selected.reference ?? "—"} />
                {selected.notes && (
                  <div className="rounded-xl bg-slate-50 p-3 text-slate-700">
                    <p className="mb-0.5 text-xs font-medium text-slate-500">Observações</p>
                    {selected.notes}
                  </div>
                )}
              </dl>

              <DialogFooter>
                {selected.receiptUrl && (
                  <Button asChild variant="outline">
                    <a href={selected.receiptUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" /> Comprovante
                    </a>
                  </Button>
                )}
                <Button asChild>
                  <Link href={`/admin/writer/${selected.writerId}`}>Ver escritor</Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 truncate text-right tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}
