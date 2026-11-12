"use client";

import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { formatCpfCnpj, isValidCpfCnpj } from "@/components/subscriptions/billing";
import { cn } from "@/lib/utils";
import { apiError } from "./types";

const COMPANY_TYPES = [
  { value: "MEI", label: "MEI" },
  { value: "LIMITED", label: "Limitada (LTDA)" },
  { value: "INDIVIDUAL", label: "Empresário individual" },
  { value: "ASSOCIATION", label: "Associação / igreja" },
];

const WALLET_ID = /^[0-9a-f-]{36}$/i;

const EMPTY_PROFILE = {
  cpfCnpj: "",
  birthDate: "",
  companyType: "MEI",
  mobilePhone: "",
  incomeValue: "",
  postalCode: "",
  address: "",
  addressNumber: "",
  complement: "",
  province: "",
};

const digits = (value: string) => value.replace(/\D/g, "");

function formatPhone(value: string) {
  const d = digits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

function formatCep(value: string) {
  const d = digits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

const button = "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-60";

function Field({
  id,
  label,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-[var(--liquid-muted)]">{hint}</p>}
    </div>
  );
}

/** Conexão com o Asaas: informar a carteira de uma conta existente ou abrir uma subconta. */
export function AsaasConnectDialog({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (message: string) => void;
}) {
  const [mode, setMode] = useState<"existing" | "create">("existing");
  const [walletId, setWalletId] = useState("");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof EMPTY_PROFILE) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setProfile((prev) => ({ ...prev, [field]: event.target.value }));

  const taxDigits = digits(profile.cpfCnpj);
  const isCompany = taxDigits.length > 11;

  const validate = (): string | null => {
    if (mode === "existing") {
      return WALLET_ID.test(walletId.trim()) ? null : "Informe o Wallet ID completo (36 caracteres).";
    }
    if (!isValidCpfCnpj(profile.cpfCnpj)) return "Confira o CPF ou CNPJ.";
    if (!isCompany && !profile.birthDate) return "Informe a data de nascimento.";
    if (digits(profile.mobilePhone).length < 10) return "Informe um celular com DDD.";
    if (!(Number(profile.incomeValue.replace(",", ".")) > 0)) return "Informe a renda ou faturamento mensal.";
    if (digits(profile.postalCode).length !== 8) return "Informe o CEP com 8 dígitos.";
    if (!profile.address.trim() || !profile.addressNumber.trim() || !profile.province.trim()) {
      return "Preencha endereço, número e bairro.";
    }
    return null;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const body =
      mode === "existing"
        ? { existingDestination: walletId.trim() }
        : {
            profile: {
              cpfCnpj: taxDigits,
              ...(isCompany ? { companyType: profile.companyType } : { birthDate: profile.birthDate }),
              mobilePhone: digits(profile.mobilePhone),
              incomeValue: Number(profile.incomeValue.replace(",", ".")),
              postalCode: digits(profile.postalCode),
              address: profile.address.trim(),
              addressNumber: profile.addressNumber.trim(),
              ...(profile.complement.trim() ? { complement: profile.complement.trim() } : {}),
              province: profile.province.trim(),
            },
          };
    try {
      const res = await fetch("/api/v1/writer/payments/asaas/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await apiError(res, "Não foi possível conectar a conta Asaas."));
      const data = (await res.json().catch(() => ({}))) as { onboardingUrl?: string | null };
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
        return;
      }
      setProfile(EMPTY_PROFILE);
      setWalletId("");
      onConnected(
        mode === "existing"
          ? "Conta Asaas conectada."
          : "Conta Asaas criada. Verifique seu e-mail para concluir o cadastro e enviar os documentos ao Asaas.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível conectar a conta Asaas.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl text-[var(--liquid-ink)] sm:max-w-lg">
        <DialogTitle className="text-xl">Conectar Asaas</DialogTitle>
        <DialogDescription className="text-[15px] text-[var(--liquid-muted)]">
          As vendas aos seus leitores caem direto na sua conta Asaas, já descontada a comissão da plataforma.
        </DialogDescription>

        <form onSubmit={submit} className="grid gap-4">
          <Tabs
            value={mode}
            onValueChange={(value) => {
              setMode(value as "existing" | "create");
              setError(null);
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Já tenho conta Asaas</TabsTrigger>
              <TabsTrigger value="create">Criar conta Asaas</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="mt-4 grid gap-4">
              <Field
                id="asaas-wallet"
                label="Wallet ID"
                hint="No Asaas, em Minha conta › Integrações. É um código com 36 caracteres."
              >
                <Input
                  id="asaas-wallet"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                />
              </Field>
            </TabsContent>

            <TabsContent value="create" className="mt-4 grid gap-4 sm:grid-cols-2">
              <p className="text-sm text-[var(--liquid-muted)] sm:col-span-2">
                Abrimos uma conta Asaas no seu nome e e-mail de cadastro. Depois, o Asaas envia um e-mail para você
                definir a senha e enviar os documentos.
              </p>
              <Field id="asaas-doc" label="CPF ou CNPJ" className="sm:col-span-2">
                <Input
                  id="asaas-doc"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  value={profile.cpfCnpj}
                  onChange={(e) => setProfile((prev) => ({ ...prev, cpfCnpj: formatCpfCnpj(e.target.value) }))}
                />
              </Field>
              {isCompany ? (
                <Field id="asaas-company" label="Tipo de empresa" className="sm:col-span-2">
                  <select
                    id="asaas-company"
                    value={profile.companyType}
                    onChange={set("companyType")}
                    className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm"
                  >
                    {COMPANY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field id="asaas-birth" label="Data de nascimento" className="sm:col-span-2">
                  <Input id="asaas-birth" type="date" value={profile.birthDate} onChange={set("birthDate")} />
                </Field>
              )}
              <Field id="asaas-phone" label="Celular">
                <Input
                  id="asaas-phone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(11) 91234-5678"
                  value={profile.mobilePhone}
                  onChange={(e) => setProfile((prev) => ({ ...prev, mobilePhone: formatPhone(e.target.value) }))}
                />
              </Field>
              <Field id="asaas-income" label={isCompany ? "Faturamento mensal (R$)" : "Renda mensal (R$)"}>
                <Input
                  id="asaas-income"
                  inputMode="decimal"
                  placeholder="5000"
                  value={profile.incomeValue}
                  onChange={set("incomeValue")}
                />
              </Field>
              <Field id="asaas-cep" label="CEP">
                <Input
                  id="asaas-cep"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  value={profile.postalCode}
                  onChange={(e) => setProfile((prev) => ({ ...prev, postalCode: formatCep(e.target.value) }))}
                />
              </Field>
              <Field id="asaas-province" label="Bairro">
                <Input id="asaas-province" value={profile.province} onChange={set("province")} />
              </Field>
              <Field id="asaas-address" label="Endereço" className="sm:col-span-2">
                <Input id="asaas-address" autoComplete="address-line1" placeholder="Rua, avenida…" value={profile.address} onChange={set("address")} />
              </Field>
              <Field id="asaas-number" label="Número">
                <Input id="asaas-number" value={profile.addressNumber} onChange={set("addressNumber")} />
              </Field>
              <Field id="asaas-complement" label="Complemento (opcional)">
                <Input id="asaas-complement" autoComplete="address-line2" value={profile.complement} onChange={set("complement")} />
              </Field>
            </TabsContent>
          </Tabs>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-600/20 bg-red-600/8 px-3.5 py-3 text-sm font-medium text-red-800">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onOpenChange(false)}
              className={cn(button, "border border-[var(--input)] text-[var(--liquid-ink)] hover:bg-[var(--muted)]")}
            >
              Voltar
            </button>
            <button type="submit" disabled={busy} className={cn(button, "bg-[var(--liquid-accent)] text-[var(--liquid-on-accent)]")}>
              {busy && <ButtonSpinner />}
              {mode === "existing" ? "Conectar conta" : "Criar conta Asaas"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
