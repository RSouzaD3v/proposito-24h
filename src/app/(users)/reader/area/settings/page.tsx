import React from "react";
import Logout from "../_components/Logout";
import { Plans } from "./_components/Plans";
import { ChangePassword } from "./_components/ChangePassword";
import { BackButton } from "@/components/ui/back-button";
import { GlassCard } from "@/components/ui/glass-card";

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <BackButton href="/reader/area" className="mb-6" />
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[var(--liquid-ink)]">
        Configurações
      </h1>
      <GlassCard strong className="flex flex-col items-stretch gap-6">
        <ChangePassword />
        <Plans />
        <Logout />
      </GlassCard>
    </div>
  );
}
