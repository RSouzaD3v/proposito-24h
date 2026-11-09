import { CircleHelp, CreditCard, Sparkles } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { apiGetOrNull } from "@/lib/api/server";
import type { ReaderProfile } from "@/lib/api/types";
import { ChangePassword } from "@/components/settings/ChangePassword";
import { SettingsGroup, SettingsLink } from "@/components/settings/SettingsList";
import { SignOutButton } from "@/components/settings/SignOutButton";
import { ThemeSwitch } from "./_components/ThemeSwitch";

function initials(name: string | null, email: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] ?? email).slice(0, 2).toUpperCase();
}

export default async function SettingsPage() {
  const [profile, billing] = await Promise.all([
    apiGetOrNull<ReaderProfile>("/reader/profile"),
    apiGetOrNull<{ isActive: boolean }>("/billing/subscription").catch(() => null),
  ]);
  const writerName = profile?.writer?.name.trim();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <BackButton href="/reader/area" className="mb-6" />
      <h1 className="mb-6 text-[1.75rem] leading-tight text-[var(--liquid-ink)]">Configurações</h1>

      {profile && (
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--muted)] text-lg font-bold text-[var(--reader-gold)]">
            {initials(profile.name, profile.email)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[var(--liquid-ink)]">{profile.name?.trim() || "Leitor"}</p>
            <p className="truncate text-sm text-[var(--liquid-muted)]">{profile.email}</p>
            {writerName && <p className="mt-0.5 truncate text-xs text-[var(--liquid-muted)]">Leitor de {writerName}</p>}
          </div>
        </div>
      )}

      <div className="grid gap-7">
        <SettingsGroup title="Assinatura">
          <SettingsLink
            href="/reader/area/subscription"
            icon={CreditCard}
            title="Minha assinatura"
            description={billing?.isActive ? "Ativa" : "Nenhuma assinatura ativa"}
          />
          {profile?.writer?.slug && (
            <SettingsLink
              href={`/reader/area/w/${profile.writer.slug}`}
              icon={Sparkles}
              title="Planos"
              description={writerName ? `Assinaturas de ${writerName}` : undefined}
            />
          )}
        </SettingsGroup>

        <SettingsGroup title="Aparência">
          <ThemeSwitch />
        </SettingsGroup>

        <SettingsGroup title="Segurança">
          <ChangePassword />
        </SettingsGroup>

        <SettingsGroup title="Ajuda">
          <SettingsLink href="/docs/leitor" icon={CircleHelp} title="Central de ajuda" description="Guias rápidos de uso" />
        </SettingsGroup>

        <SignOutButton />
      </div>
    </div>
  );
}
