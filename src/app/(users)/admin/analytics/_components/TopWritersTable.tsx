"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
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
import { cents, INT, PCT } from "../../_lib/format";

export type TopWriter = {
  writer_id: string;
  writer_name: string;
  revenue_cents: number;
  gross_cents: number;
  platform_fee_cents: number;
  sales: number;
};

export function TopWritersTable({ writers, totalNetCents }: { writers: TopWriter[]; totalNetCents: number }) {
  const [selected, setSelected] = useState<TopWriter | null>(null);
  const max = Math.max(1, ...writers.map(({ revenue_cents }) => revenue_cents));

  if (writers.length === 0) {
    return <p className="px-5 py-12 text-center text-sm text-[var(--liquid-muted)]">Nenhuma venda no período.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-y border-black/5 text-left text-xs text-[var(--liquid-muted)]">
              <th className="w-10 py-2 pl-5 font-medium">#</th>
              <th className="px-3 py-2 font-medium">Escritor</th>
              <th className="px-3 py-2 text-right font-medium">Vendas</th>
              <th className="px-3 py-2 text-right font-medium">Bruto</th>
              <th className="px-3 py-2 text-right font-medium">Comissão</th>
              <th className="px-3 py-2 text-right font-medium">Líquido</th>
              <th className="w-10 pr-5" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {writers.map((writer, index) => (
              <tr
                key={writer.writer_id}
                onClick={() => setSelected(writer)}
                className="group cursor-pointer border-b border-black/5 transition-colors last:border-0 hover:bg-white/55"
              >
                <td className="py-3 pl-5">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                      index === 0 ? "bg-amber-100 text-amber-800" : "bg-black/5 text-[var(--liquid-muted)]",
                    )}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <button type="button" className="block w-full text-left font-medium text-[var(--liquid-ink)] focus-visible:outline-none group-hover:underline">
                    {writer.writer_name}
                  </button>
                  <span className="mt-1 block h-1.5 w-full max-w-48 rounded-full bg-black/5">
                    <span className="block h-full rounded-full bg-[#2a78d6]" style={{ width: `${(writer.revenue_cents / max) * 100}%` }} />
                  </span>
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{INT.format(writer.sales)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--liquid-muted)]">{cents(writer.gross_cents)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--liquid-muted)]">{cents(writer.platform_fee_cents)}</td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums">{cents(writer.revenue_cents)}</td>
                <td className="pr-5">
                  <ChevronRight className="size-4 text-[var(--liquid-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6">{selected.writer_name}</DialogTitle>
                <DialogDescription>Desempenho no período selecionado</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-2">
                <Highlight label="Receita líquida" value={cents(selected.revenue_cents)} />
                <Highlight
                  label="Participação"
                  value={PCT.format(totalNetCents ? Math.min(selected.revenue_cents / totalNetCents, 1) : 0)}
                />
              </div>

              <dl className="grid gap-2 text-sm">
                <Row label="Vendas pagas" value={INT.format(selected.sales)} />
                <Row label="Ticket médio" value={cents(selected.sales ? selected.gross_cents / selected.sales : 0)} />
                <Row label="Volume bruto" value={cents(selected.gross_cents)} />
                <Row label="Taxas e descontos (bruto − líquido)" value={`− ${cents(Math.max(selected.gross_cents - selected.revenue_cents, 0))}`} />
                <Row label="Comissão da plataforma" value={cents(selected.platform_fee_cents)} />
                <Row
                  label="Take rate"
                  value={PCT.format(selected.gross_cents ? selected.platform_fee_cents / selected.gross_cents : 0)}
                />
              </dl>

              <DialogFooter>
                <Button asChild>
                  <Link href={`/admin/writer/${selected.writer_id}`}>Abrir painel do escritor</Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Highlight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}
