export const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const INT = new Intl.NumberFormat("pt-BR");
export const PCT = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

export const cents = (value: number | null | undefined) => BRL.format(Number(value ?? 0) / 100);

/** Variação percentual; sem base de comparação, não há percentual a mostrar. */
export function deltaOf(current: number, previous: number): number | "new" | null {
  if (previous === 0) return current === 0 ? null : "new";
  return Math.round(((current - previous) / previous) * 100);
}

export const RANGES = [
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "365d", label: "1 ano" },
] as const;

export function rangeOf(requested: string | undefined) {
  return RANGES.find(({ key }) => key === requested) ?? RANGES[1];
}

export const SUBSCRIPTION_STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativas", color: "#1baf7a" },
  TRIALING: { label: "Em teste", color: "#2a78d6" },
  PAST_DUE: { label: "Pagamento atrasado", color: "#eb6834" },
  PAUSED: { label: "Pausadas", color: "#8a94a6" },
  CANCELED: { label: "Canceladas", color: "#d64545" },
  UNPAID: { label: "Não pagas", color: "#b5476b" },
  INCOMPLETE: { label: "Incompletas", color: "#c9a227" },
  INCOMPLETE_EXPIRED: { label: "Expiradas", color: "#a3a3a3" },
};

export const PURCHASE_STATUS: Record<string, { label: string; className: string }> = {
  SUCCESS: { label: "Pago", className: "bg-emerald-100/80 text-emerald-800" },
  PENDING: { label: "Pendente", className: "bg-amber-100/80 text-amber-800" },
  FAILED: { label: "Falhou", className: "bg-red-100/80 text-red-800" },
};

export const PAYOUT_STATUS: Record<string, { label: string; className: string }> = {
  PAID: { label: "Pago", className: "bg-emerald-100/80 text-emerald-800" },
  PENDING: { label: "Pendente", className: "bg-amber-100/80 text-amber-800" },
  CANCELED: { label: "Cancelado", className: "bg-red-100/80 text-red-800" },
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
