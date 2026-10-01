import * as React from "react"
import { cn } from "@/lib/utils"
import { BackButton } from "@/components/ui/back-button"

type PageHeaderProps = {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  centered?: boolean
  className?: string
}

function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  actions,
  centered = false,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-col gap-4 animate-glass-in",
        className
      )}
    >
      {backHref && (
        <div className={cn(centered && "flex justify-start")}>
          <BackButton href={backHref} label={backLabel} />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
          centered && "sm:flex-col sm:items-center text-center"
        )}
      >
        <div className={cn("space-y-1.5", centered && "max-w-xl")}>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="text-base text-[var(--liquid-muted)] md:text-lg">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-3",
              centered && "justify-center"
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

export { PageHeader }
