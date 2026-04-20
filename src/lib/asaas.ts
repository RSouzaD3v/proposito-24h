/**
 * Cliente HTTP para Asaas API v3 (conta única).
 * @see https://docs.asaas.com/
 */

const DEFAULT_BASE = "https://api-sandbox.asaas.com/v3";

function getBaseUrl(): string {
  const u = process.env.ASAAS_API_URL?.replace(/\/$/, "");
  return u || DEFAULT_BASE;
}

function getApiKey(): string {
  const k = `$${process.env.ASAAS_API_KEY}`;
  if (!k) throw new Error("ASAAS_API_KEY não configurada");
  return k;
}

/**
 * Redirecionamento pós-pagamento no Asaas exige domínio cadastrado em Minha Conta → Informações.
 * Defina `ASAAS_CALLBACK_BASE_URL` com esse domínio (ex.: https://devotionalapp.com.br).
 * Sem essa variável, as cobranças são criadas sem `callback` (fatura e webhook continuam válidos).
 */
export function asaasRedirectCallback(
  pathWithQuery: string
): { successUrl: string; autoRedirect: boolean } | undefined {
  const base = process.env.ASAAS_CALLBACK_BASE_URL?.trim();
  if (!base) return undefined;
  const normalized = base.replace(/\/+$/, "");
  const path = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
  try {
    const successUrl = new URL(path, `${normalized}/`).href;
    return { successUrl, autoRedirect: true };
  } catch {
    return undefined;
  }
}

export function centsToAsaasValue(cents: number): number {
  return Math.round(cents) / 100;
}

export function asaasValueToCents(value: number): number {
  return Math.round(value * 100);
}

export function formatDateYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

export type AsaasBillingType =
  | "UNDEFINED"
  | "BOLETO"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "PIX"
  | "TRANSFER"
  | "DEPOSIT";

export type AsaasSubscriptionCycle =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "BIMONTHLY"
  | "QUARTERLY"
  | "SEMIANNUALLY"
  | "YEARLY";

export type AsaasSubscriptionStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

export interface AsaasCustomer {
  id: string;
  name?: string;
  email?: string;
  cpfCnpj?: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  subscription?: string | null;
  value: number;
  netValue?: number;
  status: string;
  billingType: string;
  dueDate: string;
  invoiceUrl?: string;
  externalReference?: string | null;
  description?: string | null;
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: string;
  cycle: AsaasSubscriptionCycle;
  value: number;
  nextDueDate: string;
  endDate?: string | null;
  description?: string | null;
  status: AsaasSubscriptionStatus;
  externalReference?: string | null;
  object?: string;
}

type AsaasErrorBody = { errors?: { code?: string; description?: string }[] };

async function asaasRequest<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    access_token: getApiKey(),
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.json !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, {
    ...init,
    headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = data as AsaasErrorBody;
    const msg =
      err?.errors?.map((e) => e.description || e.code).join("; ") ||
      `Asaas HTTP ${res.status}: ${text.slice(0, 200)}`;
    throw new Error(msg);
  }
  return data as T;
}

export async function createCustomer(input: {
  name?: string | null;
  email: string;
  externalReference?: string;
}): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>("/customers", {
    method: "POST",
    json: {
      name: input.name || input.email.split("@")[0],
      email: input.email,
      ...(input.externalReference ? { externalReference: input.externalReference } : {}),
    },
  });
}

export async function getCustomer(id: string): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>(`/customers/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function createPayment(input: {
  customer: string;
  value: number;
  dueDate: string;
  billingType?: AsaasBillingType;
  externalReference: string;
  description?: string;
  callback?: { successUrl: string; autoRedirect?: boolean };
}): Promise<AsaasPayment> {
  return asaasRequest<AsaasPayment>("/payments", {
    method: "POST",
    json: {
      customer: input.customer,
      billingType: input.billingType ?? "UNDEFINED",
      value: input.value,
      dueDate: input.dueDate,
      externalReference: input.externalReference,
      ...(input.description ? { description: input.description } : {}),
      ...(input.callback ? { callback: input.callback } : {}),
    },
  });
}

export async function getPayment(id: string): Promise<AsaasPayment> {
  return asaasRequest<AsaasPayment>(`/payments/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function createSubscription(input: {
  customer: string;
  value: number;
  nextDueDate: string;
  cycle: AsaasSubscriptionCycle;
  billingType?: AsaasBillingType;
  description?: string;
  externalReference: string;
  callback?: { successUrl: string; autoRedirect?: boolean };
}): Promise<AsaasSubscription> {
  return asaasRequest<AsaasSubscription>("/subscriptions", {
    method: "POST",
    json: {
      customer: input.customer,
      billingType: input.billingType ?? "UNDEFINED",
      value: input.value,
      nextDueDate: input.nextDueDate,
      cycle: input.cycle,
      externalReference: input.externalReference,
      ...(input.description ? { description: input.description } : {}),
      ...(input.callback ? { callback: input.callback } : {}),
    },
  });
}

export async function getSubscription(id: string): Promise<AsaasSubscription> {
  return asaasRequest<AsaasSubscription>(`/subscriptions/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function deleteSubscription(id: string): Promise<{ deleted: boolean; id: string }> {
  return asaasRequest<{ deleted: boolean; id: string }>(
    `/subscriptions/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export async function listSubscriptionPayments(subscriptionId: string): Promise<AsaasPayment[]> {
  const res = await asaasRequest<{ data: AsaasPayment[] } | AsaasPayment[]>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}/payments`,
    { method: "GET" }
  );
  if (Array.isArray(res)) return res;
  return res.data ?? [];
}

/** Mapeia intervalo do Prisma para ciclo Asaas. */
export function subscriptionIntervalToCycle(
  interval: "DAY" | "WEEK" | "MONTH" | "YEAR" | "LIFETIME"
): AsaasSubscriptionCycle | "LIFETIME" {
  switch (interval) {
    case "DAY":
      return "WEEKLY";
    case "WEEK":
      return "WEEKLY";
    case "MONTH":
      return "MONTHLY";
    case "YEAR":
      return "YEARLY";
    case "LIFETIME":
      return "LIFETIME";
    default:
      return "MONTHLY";
  }
}

export async function getOrCreateAsaasCustomerForUser(user: {
  id: string;
  email: string;
  name?: string | null;
  asaasCustomerId?: string | null;
}): Promise<string> {
  if (user.asaasCustomerId) {
    try {
      await getCustomer(user.asaasCustomerId);
      return user.asaasCustomerId;
    } catch {
      // recria se inválido
    }
  }
  const c = await createCustomer({
    email: user.email,
    name: user.name,
    externalReference: `user:${user.id}`,
  });
  return c.id;
}

export async function getOrCreateAsaasCustomerForWriter(writer: {
  id: string;
  email: string;
  name?: string | null;
  asaasCustomerId?: string | null;
}): Promise<string> {
  if (writer.asaasCustomerId) {
    try {
      await getCustomer(writer.asaasCustomerId);
      return writer.asaasCustomerId;
    } catch {
      //
    }
  }
  const c = await createCustomer({
    email: writer.email,
    name: writer.name,
    externalReference: `writer:${writer.id}`,
  });
  return c.id;
}

/** Primeira cobrança pendente com link de fatura, ou a primeira da lista. */
export async function getFirstInvoiceUrlForSubscription(
  subscriptionId: string
): Promise<string | null> {
  const payments = await listSubscriptionPayments(subscriptionId);
  const pending = payments.find(
    (p) =>
      p.invoiceUrl &&
      (p.status === "PENDING" || p.status === "OVERDUE" || p.status === "CONFIRMED")
  );
  const any = payments.find((p) => p.invoiceUrl);
  return (pending || any)?.invoiceUrl ?? null;
}
