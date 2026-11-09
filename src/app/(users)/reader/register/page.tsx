// app/reader/register/page.tsx
import Link from "next/link";
import { SearchX } from "lucide-react";
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
          <h1 className="text-3xl">Endereço não encontrado</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--liquid-muted)]">
            O subdomínio <b>{subdomain || "vazio"}</b> não está registrado para nenhum escritor. Confira o link
            recebido e tente novamente.
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
      <ReaderRegister writer={{ slug: writer.slug }} />
    </AuthShell>
  );
}
