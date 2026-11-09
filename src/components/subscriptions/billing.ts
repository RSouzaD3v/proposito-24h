export type Plan = {
  id: string;
  interval: "DAY" | "WEEK" | "MONTH" | "YEAR" | "LIFETIME";
  amountCents: number;
  currency: string;
  trialDays: number;
  isActive: boolean;
};

const PERIOD: Record<Plan["interval"], { name: string; per: string }> = {
  DAY: { name: "Diário", per: "dia" },
  WEEK: { name: "Semanal", per: "semana" },
  MONTH: { name: "Mensal", per: "mês" },
  YEAR: { name: "Anual", per: "ano" },
  LIFETIME: { name: "Acesso vitalício", per: "" },
};

export const planName = (plan: Plan) => PERIOD[plan.interval]?.name ?? "Plano";
export const planPeriod = (plan: Plan) => PERIOD[plan.interval]?.per ?? "";

export function formatMoney(cents: number, currency = "BRL") {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100);
  } catch {
    return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
  }
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

/** Máscara progressiva: CPF até 11 dígitos, CNPJ a partir do 12º. */
export function formatCpfCnpj(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function checkDigit(digits: string, weights: number[]) {
  const sum = weights.reduce((total, weight, index) => total + Number(digits[index]) * weight, 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/** Mesma regra da API: evita mandar o leitor ao pagamento com um documento que será recusado. */
export function isValidCpfCnpj(value: string) {
  const d = value.replace(/\D/g, "");
  if (/^(\d)\1+$/.test(d)) return false;
  if (d.length === 11) {
    return (
      checkDigit(d, [10, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(d[9]) &&
      checkDigit(d, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(d[10])
    );
  }
  if (d.length === 14) {
    return (
      checkDigit(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(d[12]) &&
      checkDigit(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(d[13])
    );
  }
  return false;
}
