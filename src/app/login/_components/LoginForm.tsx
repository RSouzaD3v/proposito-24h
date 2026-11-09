"use client";

import { useEffect, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  AuthAlert,
  AuthField,
  AuthSubmit,
  PasswordField,
  authInputClass,
  authLinkClass,
} from "@/components/auth/auth-fields";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const success = useSearchParams().get("success");

  useEffect(() => {
    getSession().then((session) => {
      if (session) router.push("/redirector");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/redirector",
    });
    if (result?.ok) {
      router.push("/redirector");
      return;
    }
    setError("E-mail ou senha incorretos.");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {success && <AuthAlert tone="success">Conta criada com sucesso! Entre para continuar.</AuthAlert>}
      {error && <AuthAlert tone="error">{error}</AuthAlert>}

      <AuthField id="email" label="E-mail">
        <Input
          id="email"
          type="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputClass}
          required
          autoComplete="email"
        />
      </AuthField>

      <PasswordField
        id="password"
        label="Senha"
        placeholder="Sua senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        action={
          <Link href="/forgot-password" className={authLinkClass}>
            Esqueceu a senha?
          </Link>
        }
      />

      <AuthSubmit loading={loading} loadingLabel="Entrando…">
        Entrar
      </AuthSubmit>
    </form>
  );
}
