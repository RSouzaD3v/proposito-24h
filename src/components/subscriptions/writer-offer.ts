export type WriterOverview = {
  active: boolean;
  activeUntil: string | null;
  offer: { amountCents: number; cycle: string; trialDays: number };
};

const CYCLE_PERIOD: Record<string, string> = {
  WEEKLY: "semana",
  BIWEEKLY: "quinzena",
  MONTHLY: "mês",
  BIMONTHLY: "bimestre",
  QUARTERLY: "trimestre",
  SEMIANNUALLY: "semestre",
  YEARLY: "ano",
};

export const cyclePeriod = (cycle: string) => CYCLE_PERIOD[cycle] ?? "mês";
