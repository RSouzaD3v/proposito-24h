import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type LoadingStateProps = {
  variant?: "full" | "inline" | "overlay"
  label?: string
  className?: string
}

function LoadingState({
  variant = "inline",
  label = "Carregando...",
  className,
}: LoadingStateProps) {
  if (variant === "full") {
    return (
      <div
        className={cn(
          "liquid-shell liquid-bg flex min-h-screen flex-col items-center justify-center gap-4",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="glass-surface flex flex-col items-center gap-3 px-8 py-7 animate-glass-in">
          <Loader2 className="size-8 animate-spin text-[var(--liquid-accent)]" />
          <p className="text-sm font-medium text-[var(--liquid-muted)]">{label}</p>
        </div>
      </div>
    )
  }

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "absolute inset-0 z-20 flex items-center justify-center bg-white/30 backdrop-blur-sm",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="glass-surface flex items-center gap-3 px-5 py-3">
          <Loader2 className="size-5 animate-spin text-[var(--liquid-accent)]" />
          <span className="text-sm font-medium text-[var(--liquid-ink)]">{label}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 py-10 text-[var(--liquid-muted)]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-5 animate-spin text-[var(--liquid-accent)]" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

function ButtonSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} />
}

export { LoadingState, ButtonSpinner }
