import { CircleHelp, CreditCard, Layers, Palette, UserRound } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { WriterShell } from "@/components/ui/writer-shell";
import { ChangePassword } from "@/components/settings/ChangePassword";
import { SettingsGroup, SettingsLink } from "@/components/settings/SettingsList";
import { SignOutButton } from "@/components/settings/SignOutButton";
import { formatDate } from "@/components/subscriptions/billing";
import type { WriterOverview } from "@/components/subscriptions/writer-offer";
import { apiGetOrNull } from "@/lib/api/server";

type WriterProfile = { id: string; slug: string; name: string; logoUrl: string | null };

export default async function WriterSettingsPage() {
  const [profile, overview] = await Promise.all([
    apiGetOrNull<WriterProfile>("/writer/profile"),
    apiGetOrNull<WriterOverview>("/billing/writer-subscription").catch(() => null),
  ]);
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "devotionalapp.com.br";
  const name = profile?.name.trim() ?? "";

  return (
    <WriterShell maxWidth="xl">
      <BackButton href="/writer/dashboard" label="Voltar ao painel" className="mb-6" />
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-[var(--liquid-ink)]">Configurações</h1>

      {profile && (
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-4">
          {profile.logoUrl ? (
            <OptimizedImage src={profile.logoUrl} alt="" width={56} height={56} className="size-14 shrink-0 rounded-xl object-contain" />
          ) : (
            <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-[var(--muted)] text-xl font-bold text-[var(--liquid-accent)]">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-[var(--liquid-ink)]">{name}</p>
            <p className="truncate text-sm text-[var(--liquid-muted)]">
              {profile.slug}.{baseDomain}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-7">
        <SettingsGroup title="Assinatura">
          <SettingsLink
            href="/writer/subscription"
            icon={CreditCard}
            title="Assinatura DevotionalApp"
            description={
              overview?.active
                ? overview.activeUntil
                  ? `Ativa · acesso até ${formatDate(overview.activeUntil)}`
                  : "Ativa"
                : "Inativa"
            }
          />
        </SettingsGroup>

        <SettingsGroup title="Sua plataforma">
          <SettingsLink href="/writer/profile" icon={UserRound} title="Perfil e marca" description="Nome do app, logo e cores" />
          <SettingsLink
            href="/writer/personalization"
            icon={Palette}
            title="Personalização"
            description="Cores da área do leitor"
          />
          {profile && (
            <SettingsLink
              href={`/writer/${profile.id}/plans`}
              icon={Layers}
              title="Planos para leitores"
              description="Preços, teste grátis e acesso ao conteúdo"
            />
          )}
        </SettingsGroup>

        <SettingsGroup title="Segurança">
          <ChangePassword />
        </SettingsGroup>

        <SettingsGroup title="Ajuda">
          <SettingsLink href="/docs/escritor" icon={CircleHelp} title="Central de ajuda" description="Guias rápidos para escritores" />
        </SettingsGroup>

        <p className="px-1 text-[13px] leading-relaxed text-[var(--liquid-muted)]">
          Os pagamentos dos seus leitores e as vendas são processados pela plataforma via Asaas.
        </p>

        <SignOutButton />
      </div>
    </WriterShell>
  );
}
