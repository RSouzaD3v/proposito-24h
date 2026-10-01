"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CreateButtonProps = {
  href?: string
  label: string
  loading?: boolean
  loadingLabel?: string
  showIcon?: boolean
  className?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

function CreateButton({
  href,
  label,
  loading = false,
  loadingLabel = "Carregando...",
  showIcon = true,
  className,
  onClick,
  type = "button",
  disabled,
}: CreateButtonProps) {
  const content = (
    <>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        showIcon && <Plus className="size-4" />
      )}
      {loading ? loadingLabel : label}
    </>
  )

  const classes = cn(
    "rounded-full px-5 font-semibold tracking-tight shadow-sm",
    className
  )

  if (href && !loading && !disabled) {
    return (
      <Button asChild variant="glass-primary" size="default" className={classes}>
        <Link href={href}>{content}</Link>
      </Button>
    )
  }

  return (
    <Button
      type={type}
      variant="glass-primary"
      size="default"
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {content}
    </Button>
  )
}

export { CreateButton }
