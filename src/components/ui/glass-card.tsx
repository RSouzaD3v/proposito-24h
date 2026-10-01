import * as React from "react"
import { cn } from "@/lib/utils"

type GlassCardProps = React.ComponentProps<"div"> & {
  strong?: boolean
  interactive?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

const paddingMap = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const

function GlassCard({
  className,
  strong = false,
  interactive = false,
  padding = "md",
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        strong ? "glass-surface-strong" : "glass-surface",
        paddingMap[padding],
        interactive &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgb(15_40_80_/_0.12)] active:translate-y-0",
        "animate-glass-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { GlassCard }
