// app/reader/register/_components/formRegister.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthAlert,
  AuthField,
  AuthSubmit,
  PasswordField,
  authInputClass,
  authLinkClass,
} from "@/components/auth/auth-fields";

export function ReaderRegister({ writer }: { writer?: { slug?: string } }) {
  const router = useRouter();
  const [form, setForm] = React.useState({ name: "", email: "", password: "", agree: true });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agree) {
      setError("É necessário aceitar os termos para continuar.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/web/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, writerSlug: writer?.slug }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        setError(err.message || "Não foi possível concluir o cadastro.");
        setLoading(false);
        return;
      }

      router.push("/login?success=1");
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}

      <AuthField id="name" label="Nome">
        <Input
          id="name"
          placeholder="Como podemos chamar você?"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={authInputClass}
          autoComplete="name"
          required
        />
      </AuthField>

      <AuthField id="email" label="E-mail">
        <Input
          id="email"
          type="email"
          placeholder="voce@email.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={authInputClass}
          autoComplete="email"
          required
        />
      </AuthField>

      <PasswordField
        id="password"
        label="Senha"
        placeholder="Crie uma senha"
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        autoComplete="new-password"
        minLength={6}
        required
        showStrength
      />

      <div className="flex items-start gap-2.5">
        <Checkbox
          id="agree"
          className="mt-0.5"
          checked={form.agree}
          onCheckedChange={(c) => setForm((f) => ({ ...f, agree: Boolean(c) }))}
        />
        <Label htmlFor="agree" className="block text-[13px] font-normal leading-snug text-[var(--liquid-muted)]">
          Li e concordo com a{" "}
          <a href="/privacy" className={authLinkClass}>
            Política de Privacidade
          </a>{" "}
          e os{" "}
          <a href="/terms" className={authLinkClass}>
            Termos de Uso
          </a>
          .
        </Label>
      </div>

      <AuthSubmit loading={loading} loadingLabel="Criando conta…">
        Criar conta
      </AuthSubmit>
    </form>
  );
}
