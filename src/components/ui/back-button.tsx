"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type BackButtonProps = {
  href: string
  label?: string
  className?: string
}

function BackButton({ href, label = "Voltar", className }: BackButtonProps) {
  return (
    <Button
      asChild
      variant="glass"
      size="sm"
      className={cn("rounded-full px-3.5 font-medium tracking-tight", className)}
    >
      <Link href={href}>
        <ArrowLeft className="size-4" />
        {label}
      </Link>
    </Button>
  )
}

export { BackButton }
