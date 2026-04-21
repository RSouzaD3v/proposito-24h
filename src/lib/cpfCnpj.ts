/**
 * Normaliza e valida CPF/CNPJ (somente dígitos) para cadastro no Asaas.
 */

export function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

function cpfChecksumOk(digits: string): boolean {
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]!, 10) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(digits[9]!, 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]!, 10) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(digits[10]!, 10);
}

function cnpjChecksumOk(digits: string): boolean {
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]!, 10) * weights1[i]!;
  let d1 = sum % 11;
  d1 = d1 < 2 ? 0 : 11 - d1;
  if (d1 !== parseInt(digits[12]!, 10)) return false;
  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(digits[i]!, 10) * weights2[i]!;
  let d2 = sum % 11;
  d2 = d2 < 2 ? 0 : 11 - d2;
  return d2 === parseInt(digits[13]!, 10);
}

export function isValidCpfCnpjDigits(digits: string): boolean {
  if (digits.length === 11) return cpfChecksumOk(digits);
  if (digits.length === 14) return cnpjChecksumOk(digits);
  return false;
}

export type ParsedCpfCnpj = { ok: true; digits: string } | { ok: false; message: string };

export function parseAndValidateCpfCnpj(raw: string): ParsedCpfCnpj {
  const digits = onlyDigits(raw);
  if (digits.length !== 11 && digits.length !== 14) {
    return { ok: false, message: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido." };
  }
  if (!isValidCpfCnpjDigits(digits)) {
    return { ok: false, message: "CPF/CNPJ inválido (dígitos verificadores incorretos)." };
  }
  return { ok: true, digits };
}
