"use client";

import { useState } from "react";
import { ChevronDown, KeyRound } from "lucide-react";
import { AuthAlert, AuthSubmit, PasswordField } from "@/components/auth/auth-fields";
import { cn } from "@/lib/utils";
import { SettingsIcon } from "./SettingsList";

export function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validationError =
    next.length > 0 && next.length < 6
      ? "A nova senha precisa ter pelo menos 6 caracteres."
      : confirm && next !== confirm
        ? "As senhas não são iguais."
        : next && next === current
          ? "A nova senha precisa ser diferente da atual."
          : null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (validationError || !current || !next || !confirm) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Não foi possível alterar a senha.");
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível alterar a senha.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="change-password"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--muted)]/50"
      >
        <SettingsIcon icon={KeyRound} />
        <span className="flex-1 text-[15px] font-medium text-[var(--liquid-ink)]">Alterar senha</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-[var(--liquid-muted)] transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <form id="change-password" onSubmit={submit} className="grid gap-4 px-4 pt-1 pb-5">
          {success && <AuthAlert tone="success">Senha alterada com sucesso.</AuthAlert>}
          {(error || validationError) && <AuthAlert tone="error">{error ?? validationError}</AuthAlert>}
          <PasswordField
            id="current-password"
            label="Senha atual"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
          <PasswordField
            id="new-password"
            label="Nova senha"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
            showStrength
          />
          <PasswordField
            id="confirm-password"
            label="Confirmar nova senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
          <AuthSubmit loading={saving} loadingLabel="Salvando…">
            Salvar nova senha
          </AuthSubmit>
        </form>
      )}
    </div>
  );
}
