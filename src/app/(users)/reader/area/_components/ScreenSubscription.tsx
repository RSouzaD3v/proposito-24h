import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export function ScreenSubscription({ slug }: { slug: string }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--reader-surface)] px-6 py-10 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-[var(--reader-gold)]/15 text-[var(--reader-gold)]">
          <LockKeyhole className="size-5" aria-hidden />
        </span>
        <p className="reader-eyebrow mt-5">Conteúdo exclusivo</p>
        <h2 className="mt-2 text-2xl text-[var(--liquid-ink)]">Disponível para assinantes</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--liquid-muted)]">
          Assine para liberar este e os demais conteúdos exclusivos do seu escritor.
        </p>
        <Link
          href={`/reader/area/w/${slug}`}
          className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--liquid-accent)] text-[15px] font-bold text-[var(--liquid-on-accent)] transition hover:brightness-95"
        >
          Ver planos
        </Link>
        <Link href="/reader/area" className="mt-4 text-sm font-semibold text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]">
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
