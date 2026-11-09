"use client";

import { signOut } from "next-auth/react";

export default function GateSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm font-semibold text-[var(--liquid-muted)] transition-colors hover:text-[var(--liquid-ink)]"
    >
      Sair da conta
    </button>
  );
}
