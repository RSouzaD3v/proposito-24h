import Link from "next/link";
import { Lock } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import {
  formatMonthYear,
  registerPath,
  writerMetrics,
  type WriterCounts,
  type WriterProfileData,
} from "../_lib/directory";
import { ShareButton } from "./ShareButton";

export function WriterAvatar({
  name,
  logoUrl,
  size,
  pixels,
}: {
  name: string;
  logoUrl: string | null;
  size: string;
  pixels: number;
}) {
  return logoUrl ? (
    <OptimizedImage src={logoUrl} alt="" width={pixels} height={pixels} className={`${size} shrink-0 rounded-2xl object-contain`} />
  ) : (
    <span className={`reader-serif ${size} grid shrink-0 place-items-center rounded-2xl bg-[var(--muted)] text-2xl`}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function WriterMetrics({ counts }: { counts: WriterCounts }) {
  const metrics = writerMetrics(counts);
  if (metrics.length === 0) {
    return <p className="text-[13px] text-[var(--liquid-muted)]">Primeiros conteúdos em breve</p>;
  }
  return (
    <dl className="flex flex-wrap gap-x-5 gap-y-2">
      {metrics.map((metric) => (
        <div key={metric.label}>
          <dd className="reader-serif text-xl leading-none">{metric.value.toLocaleString("pt-BR")}</dd>
          <dt className="mt-1 text-xs text-[var(--liquid-muted)]">{metric.value === 1 ? metric.singular : metric.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function WriterProfile({ writer }: { writer: WriterProfileData }) {
  const name = writer.name.trim();

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
      <div className="flex items-center gap-4 pr-6">
        <WriterAvatar name={name} logoUrl={writer.logoUrl} size="size-20" pixels={80} />
        <div className="min-w-0">
          <p className="reader-serif text-2xl leading-tight sm:text-[1.75rem]">{name}</p>
          <p className="mt-1 text-[13px] text-[var(--liquid-muted)]">
            Na plataforma desde {formatMonthYear(writer.createdAt)}
            {writer.lastPublishedAt && ` · Publicou em ${formatMonthYear(writer.lastPublishedAt)}`}
          </p>
        </div>
      </div>

      <section className="rounded-2xl bg-[var(--muted)]/60 p-4">
        <h3 className="reader-eyebrow mb-3">Conteúdos publicados</h3>
        <WriterMetrics counts={writer} />
      </section>

      {writer.latestDevotionals.length > 0 && (
        <section>
          <h3 className="reader-eyebrow">Devocionais recentes</h3>
          <ul className="mt-2 divide-y divide-[var(--border)]">
            {writer.latestDevotionals.map((devotional) => (
              <li key={devotional.id} className="truncate py-2.5 text-sm">
                {devotional.title}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-3">
        <div className="flex gap-2">
          <Link
            href={registerPath(writer.slug)}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[var(--liquid-accent)] px-4 text-[15px] font-bold text-[var(--liquid-on-accent)] transition hover:brightness-95"
          >
            Criar conta com este escritor
          </Link>
          <ShareButton name={name} slug={writer.slug} />
        </div>
        <p className="flex items-start gap-2 text-[13px] leading-snug text-[var(--liquid-muted)]">
          <Lock className="mt-0.5 size-3.5 shrink-0 text-[var(--reader-gold)]" aria-hidden />
          Sua conta fica vinculada a este escritor. Por enquanto, essa escolha é vitalícia.
        </p>
      </div>
    </div>
  );
}
