"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

export const authInputClass =
  "h-12 rounded-xl border-[var(--input)] bg-[var(--reader-surface)] px-4 text-base shadow-none md:text-[15px] focus-visible:border-[var(--liquid-accent)] focus-visible:ring-[var(--liquid-accent)]/20";

export const authLinkClass =
  "font-semibold text-[var(--liquid-ink)] underline decoration-[var(--reader-gold)] decoration-1 underline-offset-4 transition-colors hover:decoration-2";

type AuthFieldProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

export function AuthField({ id, label, hint, action, children }: AuthFieldProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-[13px] font-semibold text-[var(--liquid-ink)]">
          {label}
        </Label>
        {action && <div className="text-[13px]">{action}</div>}
      </div>
      {children}
      {hint && <div className="text-[13px] leading-snug text-[var(--liquid-muted)]">{hint}</div>}
    </div>
  );
}

type PasswordFieldProps = Omit<ComponentProps<typeof Input>, "type" | "className"> & {
  id: string;
  label: string;
  action?: ReactNode;
  showStrength?: boolean;
};

function passwordStrength(password: string) {
  let score = 0;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score === 3 && password.length >= 8) return { level: 3, label: "Senha forte", color: "bg-emerald-600" };
  if (score >= 1) return { level: 2, label: "Senha razoável", color: "bg-amber-500" };
  return { level: 1, label: "Senha fraca", color: "bg-red-500" };
}

export function PasswordField({ id, label, action, showStrength, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const value = String(inputProps.value ?? "");
  const tooShort = value.length < 6;
  const strength = passwordStrength(value);

  return (
    <AuthField
      id={id}
      label={label}
      action={action}
      hint={
        showStrength && (
          <div aria-live="polite">
            {!tooShort && (
              <div className="mb-1.5 flex gap-1" aria-hidden>
                {[1, 2, 3].map((level) => (
                  <span
                    key={level}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      level <= strength.level ? strength.color : "bg-[var(--muted)]",
                    )}
                  />
                ))}
              </div>
            )}
            {tooShort ? "Use pelo menos 6 caracteres." : `${strength.label}. Maiúsculas, números e símbolos ajudam.`}
          </div>
        )
      }
    >
      <div className="relative">
        <Input id={id} type={visible ? "text" : "password"} className={cn(authInputClass, "pr-12")} {...inputProps} />
        <button
          type="button"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-[var(--liquid-muted)] transition-colors hover:text-[var(--liquid-ink)]"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
    </AuthField>
  );
}

export function AuthAlert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const Icon = tone === "error" ? CircleAlert : CircleCheck;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium",
        tone === "error"
          ? "border-red-600/20 bg-red-600/8 text-red-800 dark:text-red-300"
          : "border-emerald-700/20 bg-emerald-700/8 text-emerald-900 dark:text-emerald-300",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function AuthSubmit({
  loading,
  loadingLabel,
  children,
}: {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className="h-12 w-full rounded-xl bg-[var(--liquid-accent)] text-[15px] font-bold text-[var(--liquid-on-accent)] shadow-[0_10px_24px_-14px_var(--liquid-accent)] hover:bg-[var(--liquid-accent)] hover:brightness-95 active:brightness-90"
    >
      {loading ? (
        <>
          <ButtonSpinner /> {loadingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
