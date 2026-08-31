"use client";

import { signOut } from "next-auth/react";

export default function GateSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-gray-600 hover:text-gray-900 underline text-sm mt-1 cursor-pointer"
    >
      Sair
    </button>
  );
}
