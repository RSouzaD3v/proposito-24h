"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, ExternalLink, Receipt } from "lucide-react";
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
import { cents, formatDateTime, PURCHASE_STATUS } from "../_lib/format";

export type RecentSale = {
  id: string;
  createdAt: string;
  amount: number;
  fees: number | null;
  netAmount: number | null;
  platformFeeCents: number | null;
  status: string;
  provider: string;
  receiptUrl: string | null;
  user: { name: string | null; email: string } | null;
  publication: { title: string } | null;
  writer: { id: string; name: string } | null;
};

const PROVIDER_LABEL: Record<string, string> = { ASAAS: "Asaas", STRIPE: "Stripe" };

function StatusPill({ status }: { status: string }) {
  const meta = PURCHASE_STATUS[status] ?? { label: status, className: "bg-slate-100 text-slate-700" };
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", meta.className)}>{meta.label}</span>;
}

const netOf = (sale: RecentSale) => sale.netAmount ?? Math.max(sale.amount - (sale.fees ?? 0), 0);

export function RecentSales({ sales }: { sales: RecentSale[] }) {
  const [selected, setSelected] = useState<RecentSale | null>(null);

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-black/5 text-[var(--liquid-muted)]">
          <Receipt className="size-5" aria-hidden />
        </span>
        <p className="text-sm text-[var(--liquid-muted)]">Nenhuma venda registrada ainda.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="-mx-2 divide-y divide-black/5">
        {sales.map((sale) => (
          <li key={sale.id}>
            <button
              type="button"
              onClick={() => setSelected(sale)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/60 focus-visible:bg-white/60 focus-visible:outline-none"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2a78d6]/10 text-sm font-semibold text-[#2a78d6]">
                {(sale.user?.name ?? sale.user?.email ?? "?").charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[var(--liquid-ink)]">
                  {sale.publication?.title ?? "Publicação removida"}
                </span>
                <span className="block truncate text-xs text-[var(--liquid-muted)]">
                  {sale.user?.name ?? sale.user?.email ?? "Leitor"} · {sale.writer?.name ?? "—"} · {formatDateTime(sale.createdAt)}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-semibold tabular-nums text-[var(--liquid-ink)]">{cents(sale.amount)}</span>
                <StatusPill status={sale.status} />
              </span>
              <ChevronRight className="size-4 shrink-0 text-[var(--liquid-muted)]" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6">{selected.publication?.title ?? "Venda"}</DialogTitle>
                <DialogDescription>
                  {formatDateTime(selected.createdAt)} · via {PROVIDER_LABEL[selected.provider] ?? selected.provider}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs text-slate-500">Valor pago</p>
                  <p className="text-2xl font-bold tabular-nums text-slate-900">{cents(selected.amount)}</p>
                </div>
                <StatusPill status={selected.status} />
              </div>

              <dl className="grid gap-2 text-sm">
                <Row label="Taxas do gateway" value={`− ${cents(selected.fees)}`} />
                <Row label="Comissão da plataforma" value={cents(selected.platformFeeCents)} />
                <Row label="Líquido" value={cents(netOf(selected))} strong />
                <div className="my-1 border-t" />
                <Row label="Comprador" value={selected.user?.name ?? "—"} />
                <Row label="E-mail" value={selected.user?.email ?? "—"} />
                <Row
                  label="Escritor"
                  value={
                    selected.writer ? (
                      <Link href={`/admin/writer/${selected.writer.id}`} className="font-medium text-[#2a78d6] hover:underline">
                        {selected.writer.name}
                      </Link>
                    ) : (
                      "—"
                    )
                  }
                />
                <Row label="ID" value={<code className="text-xs">{selected.id}</code>} />
              </dl>

              <DialogFooter>
                {selected.receiptUrl && (
                  <Button asChild variant="outline">
                    <a href={selected.receiptUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" /> Recibo
                    </a>
                  </Button>
                )}
                {selected.writer && (
                  <Button asChild>
                    <Link href={`/admin/writer/${selected.writer.id}`}>Ver escritor</Link>
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn("min-w-0 truncate text-right tabular-nums text-slate-900", strong && "font-semibold")}>{value}</dd>
    </div>
  );
}
