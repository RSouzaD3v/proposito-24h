// app/reader/register/_components/formRegister.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

export function ReaderRegister({
  writer,
}: {
  writer?: { id?: string; name?: string | null };
}) {
  const router = useRouter();
  const [form, setForm] = React.useState({ name: "", email: "", password: "", agree: true });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPass, setShowPass] = React.useState(false);

  const passwordScore = React.useMemo(() => {
    // Indicador simples de força (apenas visual)
    let score = 0;
    if (form.password.length >= 6) score += 35;
    if (/[A-Z]/.test(form.password)) score += 20;
    if (/[0-9]/.test(form.password)) score += 20;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 25;
    return Math.min(score, 100);
  }, [form.password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agree) {
      setError("É necessário aceitar os termos para continuar.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reader/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, writerId: writer?.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        setError(err.message || "Não foi possível concluir o cadastro.");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch (e) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <CardDescription className="text-center text-sm">
        Preencha seus dados para acessar os conteúdos de {writer?.name ?? "nosso escritor"}.
      </CardDescription>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {/* Nome */}
        <div className="grid gap-2">
          <Label htmlFor="name" className="inline-flex items-center gap-2">
            <User className="size-4" /> Nome
          </Label>
          <Input
            id="name"
            placeholder="Seu nome completo"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>

        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email" className="inline-flex items-center gap-2">
            <Mail className="size-4" /> E‑mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@email.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>

        {/* Senha */}
        <div className="grid gap-2">
          <Label htmlFor="password" className="inline-flex items-center gap-2">
            <Lock className="size-4" /> Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="Mínimo de 6 caracteres"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
            <button
              type="button"
              aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPass((s) => !s)}
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <Progress value={passwordScore} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Use maiúsculas, números e símbolos para uma senha mais forte.
          </p>
        </div>

        {/* Termos */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="agree"
            checked={form.agree}
            onCheckedChange={(c) => setForm((f) => ({ ...f, agree: Boolean(c) }))}
          />
          <Label htmlFor="agree" className="text-sm text-muted-foreground">
            Eu li e concordo com a {" "}
            <a href="/terms" className="underline">Política e Termos</a>.
          </Label>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="h-11 w-full">
        {loading ? (
          <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Registrando…</span>
        ) : (
          "Registrar"
        )}
      </Button>

      <CardFooter className="-mt-2 flex justify-center p-0 text-xs text-muted-foreground">
        Já tem uma conta? {" "}
        <a href="/login" className="ml-1 font-medium underline">Entrar</a>
      </CardFooter>
    </form>
  );
}
