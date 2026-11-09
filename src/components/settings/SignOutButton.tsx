"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] text-[15px] font-semibold text-red-700 transition-colors hover:bg-red-600/8 dark:text-red-300"
    >
      <LogOut className="size-4" aria-hidden />
      Sair da conta
    </button>
  );
}
