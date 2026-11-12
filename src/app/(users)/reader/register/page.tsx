// app/reader/register/page.tsx
import Link from "next/link";
import { Lock, SearchX } from "lucide-react";
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import { authLinkClass } from "@/components/auth/auth-fields";
import { getWriterFromHost } from "@/lib/writer-host";
import { ReaderRegister } from "./_components/formRegister";

export default async function ReaderRegisterPage() {
  const { subdomain, writer } = await getWriterFromHost();

  if (!writer) {
    return (
      <div className="reader-premium grid min-h-screen place-items-center bg-[var(--reader-bg)] px-5 text-center text-[var(--liquid-ink)]">
        <div className="animate-glass-in max-w-md">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[var(--muted)]">
            <SearchX className="size-6 text-[var(--liquid-muted)]" />
          </div>
          <h1 className="text-3xl">{subdomain ? "Endereço não encontrado" : "Use o link do seu escritor"}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--liquid-muted)]">
            {subdomain ? (
              <>
                O endereço <b>{subdomain}</b> não está registrado para nenhum escritor. Confira o link recebido.
              </>
            ) : (
              "A conta de leitor é criada pelo endereço do escritor que você acompanha. Abra o link que ele compartilhou."
            )}{" "}
            <Link href="/docs/leitor#criar-conta" className={authLinkClass}>
              Saiba mais
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      image="/bible3d.webp"
      sceneEyebrow={writer.name}
      sceneTitle="Uma palavra para começar cada dia."
      sceneBody="Devocionais, orações e leituras para acompanhar sua caminhada."
      brandName={writer.name}
      brandLogoUrl={writer.logoUrl}
      accent={writer.colorPrimary}
      topAction={
        <>
          <span className="hidden sm:inline">Já tem conta? </span>
          <Link href="/login" className={authLinkClass}>
            Entrar
          </Link>
        </>
      }
    >
      <AuthHeading title="Crie sua conta" description={`Acesse os conteúdos de ${writer.name} em poucos segundos.`} />
      <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--reader-surface)] px-3.5 py-3 text-[13px] leading-snug text-[var(--liquid-muted)]">
        <Lock className="mt-0.5 size-4 shrink-0 text-[var(--reader-gold)]" aria-hidden />
        <p>
          Sua conta ficará vinculada a <b className="font-semibold text-[var(--liquid-ink)]">{writer.name.trim()}</b>. Por
          enquanto, essa escolha é vitalícia: não será possível trocar de escritor depois.
        </p>
      </div>
      <ReaderRegister writer={{ slug: writer.slug }} />
    </AuthShell>
  );
}
