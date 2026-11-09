import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Tela curta de situação (sucesso, pendência, bloqueio), no padrão das telas de assinatura. */
export function StatusScreen({
  icon,
  tone = "neutral",
  title,
  text,
  children,
}: {
  icon: ReactNode;
  tone?: "neutral" | "success" | "warning";
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid min-h-[80vh] place-items-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--reader-surface)] px-6 py-10 text-center">
        <span
          className={cn(
            "grid size-12 place-items-center rounded-full",
            tone === "success" && "bg-emerald-600/12 text-emerald-700",
            tone === "warning" && "bg-amber-500/15 text-amber-700",
            tone === "neutral" && "bg-[var(--liquid-accent)]/12 text-[var(--liquid-accent)]",
          )}
        >
          {icon}
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--liquid-ink)]">{title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--liquid-muted)]">{text}</p>
        {children && <div className="mt-7 flex w-full flex-col items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}

export const statusPrimaryButton =
  "inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--liquid-accent)] text-[15px] font-bold text-[var(--liquid-on-accent)] transition hover:brightness-95";
