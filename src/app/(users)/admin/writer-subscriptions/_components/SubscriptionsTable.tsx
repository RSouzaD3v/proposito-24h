"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronRight, Copy, CreditCard } from "lucide-react";
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
import { cents, CYCLE, formatDate } from "../../_lib/format";

export type WriterSubscription = {
  id: string;
  description: string | null;
  amount: number;
  interval: string;
  provider: string;
  startedAt: string;
  endedAt: string | null;
  canceledAt: string | null;
  commitmentMonths: number;
  commitmentEndsAt: string | null;
  earlyCancelFeePct: number;
  cancellationFeeCents: number | null;
  asaasSubscriptionId: string | null;
  stripeId: string | null;
  writer: { id: string; name: string; slug: string } | null;
};

const PROVIDER: Record<string, string> = { ASAAS: "Asaas", STRIPE: "Stripe" };

/** Situação exibida: encerrada, cancelada (ainda com acesso até o fim) ou ativa. */
function stateOf(sub: WriterSubscription, now: number) {
  if (sub.endedAt && new Date(sub.endedAt).getTime() <= now) {
    return { label: "Encerrada", className: "bg-slate-200/80 text-slate-700" };
  }
  if (sub.canceledAt) return { label: "Cancelada", className: "bg-amber-100/80 text-amber-800" };
  return { label: "Ativa", className: "bg-emerald-100/80 text-emerald-800" };
}

export function SubscriptionsTable({ subscriptions }: { subscriptions: WriterSubscription[] }) {
  const [selected, setSelected] = useState<WriterSubscription | null>(null);
  const [now] = useState(() => Date.now());

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] text-sm">
          <thead>
            <tr className="border-y border-black/5 text-left text-xs text-[var(--liquid-muted)]">
              <th className="py-2 pl-5 pr-3 font-medium">Escritor</th>
              <th className="px-3 py-2 font-medium">Plano</th>
              <th className="px-3 py-2 text-right font-medium">Valor</th>
              <th className="px-3 py-2 text-right font-medium">MRR</th>
              <th className="px-3 py-2 font-medium">Início</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="w-10 pr-5" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const state = stateOf(sub, now);
              const cycle = CYCLE[sub.interval] ?? CYCLE.MONTH;
              return (
                <tr
                  key={sub.id}
                  onClick={() => setSelected(sub)}
                  className="group cursor-pointer border-b border-black/5 transition-colors last:border-0 hover:bg-white/55"
                >
                  <td className="py-3 pl-5 pr-3">
                    <button type="button" className="flex items-center gap-3 text-left focus-visible:outline-none">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1baf7a]/12 text-xs font-semibold text-[#138a60]">
                        {(sub.writer?.name ?? "?").charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-[var(--liquid-ink)] group-hover:underline">
                          {sub.writer?.name ?? "Escritor removido"}
                        </span>
                        {sub.description && (
                          <span className="block max-w-[16rem] truncate text-xs text-[var(--liquid-muted)]">{sub.description}</span>
                        )}
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[var(--liquid-ink)]">{cycle.name}</span>
                    <span className="block text-xs text-[var(--liquid-muted)]">
                      {PROVIDER[sub.provider] ?? sub.provider}
                      {sub.commitmentMonths > 0 ? ` · fidelidade ${sub.commitmentMonths}m` : ""}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {cents(sub.amount)}
                    <span className="block text-xs text-[var(--liquid-muted)]">/{cycle.per}</span>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">{cents(sub.amount / cycle.months)}</td>
                  <td className="px-3 py-3 text-[var(--liquid-muted)]">{formatDate(sub.startedAt)}</td>
                  <td className="px-3 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", state.className)}>{state.label}</span>
                  </td>
                  <td className="pr-5">
                    <ChevronRight className="size-4 text-[var(--liquid-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </td>
                </tr>
              );
            })}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-2xl bg-black/5 text-[var(--liquid-muted)]">
                    <CreditCard className="size-5" aria-hidden />
                  </span>
                  <span className="text-[var(--liquid-muted)]">Nenhuma assinatura encontrada com esses filtros.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <SubscriptionDetails sub={selected} now={now} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SubscriptionDetails({ sub, now }: { sub: WriterSubscription; now: number }) {
  const cycle = CYCLE[sub.interval] ?? CYCLE.MONTH;
  const state = stateOf(sub, now);
  const externalId = sub.asaasSubscriptionId ?? sub.stripeId;
  const inCommitment = sub.commitmentEndsAt ? new Date(sub.commitmentEndsAt).getTime() > now : false;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="pr-6">{sub.writer?.name ?? "Assinatura"}</DialogTitle>
        <DialogDescription>
          Plano {cycle.name.toLowerCase()} via {PROVIDER[sub.provider] ?? sub.provider}
          {sub.description ? ` · ${sub.description}` : ""}
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
        <div>
          <p className="text-xs text-slate-500">Valor por {cycle.per}</p>
          <p className="text-2xl font-bold tabular-nums text-slate-900">{cents(sub.amount)}</p>
          <p className="text-xs text-slate-500">{cents(sub.amount / cycle.months)} de MRR</p>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", state.className)}>{state.label}</span>
      </div>

      <dl className="grid gap-2 text-sm">
        <Row label="Início" value={formatDate(sub.startedAt)} />
        <Row label="Cancelada em" value={sub.canceledAt ? formatDate(sub.canceledAt) : "—"} />
        <Row label="Acesso até" value={sub.endedAt ? formatDate(sub.endedAt) : "Renovação automática"} />
        <div className="my-1 border-t" />
        <Row
          label="Fidelidade"
          value={
            sub.commitmentMonths > 0
              ? `${sub.commitmentMonths} meses${sub.commitmentEndsAt ? ` · até ${formatDate(sub.commitmentEndsAt)}` : ""}`
              : "Sem fidelidade"
          }
        />
        {sub.commitmentMonths > 0 && (
          <Row label="Multa contratada" value={`${sub.earlyCancelFeePct}% das parcelas restantes${inCommitment ? " (vigente)" : ""}`} />
        )}
        {sub.cancellationFeeCents !== null && <Row label="Multa cobrada" value={cents(sub.cancellationFeeCents)} />}
        {externalId && (
          <>
            <div className="my-1 border-t" />
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">ID no {PROVIDER[sub.provider] ?? "gateway"}</dt>
              <dd className="flex min-w-0 items-center gap-1">
                <code className="truncate text-xs text-slate-900">{externalId}</code>
                <CopyButton value={externalId} />
              </dd>
            </div>
          </>
        )}
      </dl>

      {sub.writer && (
        <DialogFooter>
          <Button asChild>
            <Link href={`/admin/writer/${sub.writer.id}`}>Abrir painel do escritor</Link>
          </Button>
        </DialogFooter>
      )}
    </>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7 shrink-0"
      aria-label="Copiar ID"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
    </Button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 truncate text-right tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}
