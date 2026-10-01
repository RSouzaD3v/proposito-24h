import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"

type NavTileProps = {
  href: string
  title: string
  description?: string
  icon?: React.ReactNode
  variant?: "default" | "destructive"
  className?: string
  children?: React.ReactNode
}

function NavTile({
  href,
  title,
  description,
  icon,
  variant = "default",
  className,
  children,
}: NavTileProps) {
  return (
    <Link href={href} className={cn("group block h-full", className)}>
      <GlassCard
        interactive
        padding="lg"
        className={cn(
          "flex h-full flex-col items-center justify-center gap-3 text-center min-h-[120px]",
          variant === "destructive" &&
            "bg-red-50/60 border-red-200/60 hover:bg-red-50/80"
        )}
      >
        {icon && (
          <span
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl shadow-sm transition-colors",
              variant === "destructive"
                ? "bg-red-100/80 text-red-700"
                : "bg-white/70 text-[var(--liquid-accent)] group-hover:bg-white/90"
            )}
          >
            {icon}
          </span>
        )}
        <span
          className={cn(
            "text-lg font-semibold tracking-tight",
            variant === "destructive"
              ? "text-red-800"
              : "text-[var(--liquid-ink)]"
          )}
        >
          {title}
        </span>
        {description && (
          <span className="text-sm text-[var(--liquid-muted)]">{description}</span>
        )}
        {children}
      </GlassCard>
    </Link>
  )
}

type NavTileButtonProps = {
  title: string
  icon?: React.ReactNode
  variant?: "default" | "destructive"
  className?: string
  onClick?: () => void
}

function NavTileButton({
  title,
  icon,
  variant = "default",
  className,
  onClick,
}: NavTileButtonProps) {
  return (
    <button type="button" onClick={onClick} className={cn("group block h-full w-full text-left", className)}>
      <GlassCard
        interactive
        padding="lg"
        className={cn(
          "flex h-full flex-col items-center justify-center gap-3 text-center min-h-[120px]",
          variant === "destructive" &&
            "bg-red-50/60 border-red-200/60 hover:bg-red-50/80"
        )}
      >
        {icon && (
          <span
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl shadow-sm transition-colors",
              variant === "destructive"
                ? "bg-red-100/80 text-red-700"
                : "bg-white/70 text-[var(--liquid-accent)]"
            )}
          >
            {icon}
          </span>
        )}
        <span
          className={cn(
            "text-lg font-semibold tracking-tight",
            variant === "destructive" ? "text-red-800" : "text-[var(--liquid-ink)]"
          )}
        >
          {title}
        </span>
      </GlassCard>
    </button>
  )
}

export { NavTile, NavTileButton }
