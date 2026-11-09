import { cookies } from "next/headers";

export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`API respondeu HTTP ${status}`);
  }
}

export type ApiResult<T> = { ok: true; status: number; data: T } | { ok: false; status: number };

async function request<T>(method: string, path: string): Promise<ApiResult<T>> {
  const cookie = (await cookies()).toString();
  const response = await fetch(`${process.env.API_URL}/v1${path}`, {
    method,
    headers: {
      "x-proxy-key": process.env.INTERNAL_API_KEY ?? "",
      ...(cookie ? { cookie } : {}),
      // Escritas com cookie exigem a origem do site, igual às feitas pelo navegador.
      ...(method !== "GET" ? { origin: new URL(process.env.NEXTAUTH_URL ?? "").origin } : {}),
    },
    cache: "no-store",
  });
  if (!response.ok) return { ok: false, status: response.status };
  return { ok: true, status: response.status, data: (await response.json()) as T };
}

/** Escrita a partir de server action; devolve também a mensagem de erro da API. */
export async function apiSend(method: "POST" | "PUT" | "DELETE", path: string, body?: unknown) {
  const cookie = (await cookies()).toString();
  const response = await fetch(`${process.env.API_URL}/v1${path}`, {
    method,
    headers: {
      "x-proxy-key": process.env.INTERNAL_API_KEY ?? "",
      ...(cookie ? { cookie } : {}),
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      origin: new URL(process.env.NEXTAUTH_URL ?? "").origin,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (response.ok) {
    const data: unknown = response.status === 204 ? null : await response.json().catch(() => null);
    return { ok: true as const, data };
  }
  const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };
  const message = Array.isArray(data.message) ? data.message[0] : data.message;
  return { ok: false as const, status: response.status, message };
}

/** Consulta a API a partir de um Server Component, repassando o cookie de sessão do usuário. */
export const apiFetch = <T>(path: string) => request<T>("GET", path);

export async function apiGet<T>(path: string): Promise<T> {
  const result = await request<T>("GET", path);
  if (!result.ok) throw new ApiError(result.status);
  return result.data;
}

const isMissing = (status: number) => status === 401 || status === 404;

/** Devolve null quando a sessão não vale mais ou o recurso não existe. */
/** Leitura de dados públicos, sem sessão, reaproveitada pelo tempo indicado. */
export async function apiPublicGet<T>(path: string, revalidateSeconds: number): Promise<T | null> {
  const response = await fetch(`${process.env.API_URL}/v1${path}`, {
    headers: { "x-proxy-key": process.env.INTERNAL_API_KEY ?? "" },
    next: { revalidate: revalidateSeconds },
  });
  if (response.ok) return (await response.json()) as T;
  if (isMissing(response.status)) return null;
  throw new ApiError(response.status);
}

export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  const result = await request<T>("GET", path);
  if (result.ok) return result.data;
  if (isMissing(result.status)) return null;
  throw new ApiError(result.status);
}

export async function apiPostOrNull<T>(path: string): Promise<T | null> {
  const result = await request<T>("POST", path);
  if (result.ok) return result.data;
  if (isMissing(result.status)) return null;
  throw new ApiError(result.status);
}
