import { parseAndValidateCpfCnpj } from "@/lib/cpfCnpj";

/**
 * Resolve CPF/CNPJ para o Asaas: usa o enviado no body ou o já salvo no usuário.
 */
export function resolveCpfCnpjForAsaas(bodyCpf: unknown, saved: string | null | undefined) {
  const fromBody = typeof bodyCpf === "string" && bodyCpf.trim() ? bodyCpf : "";
  const raw = fromBody || saved || "";
  return parseAndValidateCpfCnpj(raw);
}
