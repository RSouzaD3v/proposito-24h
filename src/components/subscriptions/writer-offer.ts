export type WriterPlanInterval = "MONTH" | "QUARTER" | "SEMESTER" | "YEAR";

export type WriterOffer = {
  provider: string;
  amountCents: number;
  interval: WriterPlanInterval;
  trialDays: number;
  commitmentMonths: number;
  /** Multa sobre as parcelas restantes da fidelidade, em % (0 = sem multa). */
  earlyCancelFeePct: number;
  requiresTaxId: boolean;
};

/** Contrato assinado: preço e fidelidade ficam travados mesmo que o admin mude a oferta. */
export type WriterContract = {
  provider: string;
  amountCents: number;
  interval: WriterPlanInterval;
  commitmentMonths: number;
  commitmentEndsAt: string | null;
  earlyCancelFeePct: number;
  canceledAt: string | null;
};

export type WriterOverview = {
  active: boolean;
  activeUntil: string | null;
  offer: WriterOffer;
  contract: WriterContract | null;
};

export type WriterCancelQuote = {
  inCommitment: boolean;
  remainingInstallments: number;
  feeCents: number;
  commitmentEndsAt: string | null;
  accessUntil: string | null;
};

const CYCLE_PERIOD: Record<string, string> = {
  MONTH: "mês",
  QUARTER: "trimestre",
  SEMESTER: "semestre",
  YEAR: "ano",
};

const CYCLE_NAME: Record<string, string> = {
  MONTH: "Mensal",
  QUARTER: "Trimestral",
  SEMESTER: "Semestral",
  YEAR: "Anual",
};

export const cyclePeriod = (interval: string) => CYCLE_PERIOD[interval] ?? "mês";
export const cycleName = (interval: string) => CYCLE_NAME[interval] ?? "Mensal";
export const WRITER_PLAN_INTERVALS = Object.keys(CYCLE_NAME) as WriterPlanInterval[];

const PROVIDER_NAME: Record<string, string> = { STRIPE: "Stripe", ASAAS: "Asaas" };
export const providerName = (provider: string | null | undefined) =>
  provider ? (PROVIDER_NAME[provider] ?? provider) : "";

/** "Fidelidade de 12 meses; cancelamento antecipado: multa de 50% das parcelas restantes." */
export function commitmentTerms(terms: { commitmentMonths: number; earlyCancelFeePct: number }) {
  if (terms.commitmentMonths <= 0) return "Sem fidelidade: cancele quando quiser, sem multa.";
  const months = `${terms.commitmentMonths} ${terms.commitmentMonths === 1 ? "mês" : "meses"}`;
  const fee =
    terms.earlyCancelFeePct > 0
      ? `multa de ${terms.earlyCancelFeePct}% das parcelas restantes`
      : "sem multa";
  return `Fidelidade de ${months}; cancelamento antecipado: ${fee}.`;
}

/** Comissão em pontos-base (100 = 1%) exibida como porcentagem: "10%", "12,5%". */
export const formatBps = (bps: number) =>
  `${(bps / 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

/** "12,5" → 1250; vazio ou inválido → null. */
export function percentToBps(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const pct = Number(normalized);
  if (!Number.isFinite(pct)) return null;
  return Math.round(pct * 100);
}

export const bpsToPercentInput = (bps: number) => (bps / 100).toLocaleString("pt-BR", { maximumFractionDigits: 2, useGrouping: false });
