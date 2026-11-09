import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, PenLine } from "lucide-react";

export const metadata: Metadata = { alternates: { canonical: "/docs" } };

function AudienceCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--reader-gold)]"
    >
      <span className="text-[var(--reader-gold)]">{icon}</span>
      <h2 className="text-2xl">{title}</h2>
      <p className="text-[15px] leading-relaxed text-[var(--liquid-muted)]">{text}</p>
      <span className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-bold">
        Ver guia
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl leading-tight sm:text-5xl">Como podemos ajudar?</h1>
      <p className="mt-3 text-[17px] text-[var(--liquid-muted)]">Escolha o seu perfil para ver o guia certo.</p>
      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        <AudienceCard
          href="/docs/leitor"
          icon={<BookOpen className="size-6" aria-hidden />}
          title="Sou leitor"
          text="Criar conta, ler o conteúdo do dia, usar a Bíblia, o Caderno e a sua assinatura."
        />
        <AudienceCard
          href="/docs/escritor"
          icon={<PenLine className="size-6" aria-hidden />}
          title="Sou escritor"
          text="Criar sua plataforma, publicar conteúdo e livros, convidar leitores e ver resultados."
        />
      </div>
    </div>
  );
}
