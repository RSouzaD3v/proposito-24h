export type ProviderInfo = { provider: string; requiresTaxId: boolean; hostedOnboarding: boolean };

export type AccountStatus = "PENDING" | "ACTIVE" | "RESTRICTED" | "DISABLED";

export type PaymentAccount = {
  provider: string;
  status: AccountStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  destinationHint: string;
  updatedAt: string;
};

export type PaymentsOverview = {
  readerPaymentProvider: string | null;
  commissionBps: number;
  platformCollectionFallback: boolean;
  availableProviders: ProviderInfo[];
  accounts: PaymentAccount[];
};

export type AccessTier = "FREE" | "SUBSCRIPTION" | "PAID_PATRON";

export type Monetization = {
  payments: PaymentsOverview;
  plans: {
    id: string;
    amountCents: number;
    currency: string;
    interval: "DAY" | "WEEK" | "MONTH" | "YEAR" | "LIFETIME";
    trialDays: number;
    isActive: boolean;
    isReaderVisible: boolean;
  }[];
  featureAccess: Record<"quote" | "devotional" | "verse" | "prayer" | "biblePlan", AccessTier>;
  library: {
    id: string;
    title: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    visibility: string;
    price: number | null;
    freePreviewChapters: number;
    accessMode: "FREE" | "SUBSCRIPTION" | "PAID";
  }[];
  readyToSell: boolean;
};

/** Lê a mensagem de erro da API (string ou lista de validação). */
export async function apiError(res: Response, fallback: string) {
  const data = (await res.json().catch(() => ({}))) as { message?: string | string[] };
  const message = Array.isArray(data.message) ? data.message[0] : data.message;
  return message || fallback;
}
