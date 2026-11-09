import { BackButton } from "@/components/ui/back-button";
import { cn } from "@/lib/utils";

export function ReadingScene({
  imageUrl,
  backHref,
  eyebrow,
  title,
  subtitle,
  scene,
  children,
}: {
  imageUrl?: string | null;
  backHref: string;
  eyebrow: string;
  title: string;
  subtitle?: string | null;
  scene: string;
  children: React.ReactNode;
}) {
  return (
    <article>
      <header className={cn("reader-scene rounded-b-[2.5rem]", scene)}>
        {imageUrl && <img src={imageUrl} alt="" />}
        <div className="mx-auto flex min-h-[24rem] w-full max-w-2xl flex-col justify-between px-5 pb-8 pt-4">
          <BackButton href={backHref} className="self-start" />
          <div className="animate-glass-in">
            <p className="reader-eyebrow" style={{ color: "rgb(255 255 255 / 0.82)" }}>{eyebrow}</p>
            <h1 className="mt-2 text-[2.25rem] leading-[1.12] md:text-5xl">{title}</h1>
            {subtitle && <p className="reader-serif mt-3 text-lg italic text-white/85">{subtitle}</p>}
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-2xl space-y-8 px-5 py-8 animate-glass-in">{children}</div>
    </article>
  );
}

export function ReadingText({ children }: { children: React.ReactNode }) {
  return (
    <p className="whitespace-pre-line text-[1.125rem] leading-[1.85] text-[var(--liquid-ink)]">{children}</p>
  );
}

export function ReadingHighlight({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="reader-serif whitespace-pre-line text-center text-[1.625rem] leading-[1.5] text-[var(--liquid-ink)]">
      {children}
    </blockquote>
  );
}

export function ReadingAudio({ src }: { src?: string | null }) {
  if (!src) return null;
  return (
    <audio controls preload="none" className="w-full">
      <source src={src} type="audio/mpeg" />
      Seu navegador não suporta o player de áudio.
    </audio>
  );
}
