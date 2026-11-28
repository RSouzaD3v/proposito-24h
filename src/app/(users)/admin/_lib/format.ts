export const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const INT = new Intl.NumberFormat("pt-BR");
export const PCT = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

export const cents = (value: number | null | undefined) => BRL.format(Number(value ?? 0) / 100);

/** Variação percentual; sem base de comparação, não há percentual a mostrar. */
export function deltaOf(current: number, previous: number): number | "new" | null {
  if (previous === 0) return current === 0 ? null : "new";
  return Math.round(((current - previous) / previous) * 100);
}

export { RANGES, rangeOf } from "@/components/ledger/ranges";

export const SUBSCRIPTION_STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativas", color: "#3f7d4f" },
  TRIALING: { label: "Em teste", color: "#2a6fa0" },
  PAST_DUE: { label: "Pagamento atrasado", color: "#c27c12" },
  PAUSED: { label: "Pausadas", color: "#a59d90" },
  CANCELED: { label: "Canceladas", color: "#b4412f" },
  UNPAID: { label: "Não pagas", color: "#8f4a8a" },
  INCOMPLETE: { label: "Incompletas", color: "#b99a52" },
  INCOMPLETE_EXPIRED: { label: "Expiradas", color: "#d3ccbf" },
};

export const PURCHASE_STATUS: Record<string, { label: string; className: string }> = {
  SUCCESS: { label: "Pago", className: "bg-[#e6efe8] text-[#2f6b45]" },
  PENDING: { label: "Pendente", className: "bg-[#f5ead6] text-[#8a5a0b]" },
  FAILED: { label: "Falhou", className: "bg-[#f6e2dd] text-[#9c3524]" },
};

export const PAYOUT_STATUS: Record<string, { label: string; className: string }> = {
  PAID: { label: "Pago", className: "bg-[#e6efe8] text-[#2f6b45]" },
  PENDING: { label: "Pendente", className: "bg-[#f5ead6] text-[#8a5a0b]" },
  CANCELED: { label: "Cancelado", className: "bg-[#f6e2dd] text-[#9c3524]" },
};

export const CYCLE: Record<string, { name: string; per: string; months: number }> = {
  MONTH: { name: "Mensal", per: "mês", months: 1 },
  QUARTER: { name: "Trimestral", per: "trimestre", months: 3 },
  SEMESTER: { name: "Semestral", per: "semestre", months: 6 },
  YEAR: { name: "Anual", per: "ano", months: 12 },
};

export const formatDate =(value: string | Date) =>
  new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export const formatDateTime = (value: string | Date) =>
  new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
