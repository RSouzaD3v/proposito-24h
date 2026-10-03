import * as React from "react"
import { cn } from "@/lib/utils"

type WriterShellProps = React.ComponentProps<"div"> & {
  /** When false, only applies liquid background (for root layout). */
  contained?: boolean
  /** Only used when `contained` is false. */
  background?: "liquid" | "plain"
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "full"
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-none",
} as const

function WriterShell({
  className,
  children,
  contained = true,
  background = "liquid",
  maxWidth = "5xl",
  ...props
}: WriterShellProps) {
  if (!contained) {
    return (
      <div
        className={cn(
          "liquid-shell min-h-screen w-full overflow-x-clip",
          background === "plain" ? "bg-white dark:bg-neutral-950" : "liquid-bg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative z-0 mx-auto w-full px-4 py-10 md:px-6 md:py-14",
        maxWidthMap[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { WriterShell }
