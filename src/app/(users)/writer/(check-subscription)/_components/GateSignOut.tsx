"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function GateSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--liquid-ink)] transition-colors hover:bg-[var(--muted)]"
    >
      <LogOut className="size-4" aria-hidden />
      Sair da conta
    </button>
  );
}
