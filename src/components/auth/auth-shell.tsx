import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { readableOn } from "@/lib/readable-on";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  image: string;
  sceneEyebrow: string;
  sceneTitle: ReactNode;
  sceneBody?: ReactNode;
  brandName?: string;
  brandLogoUrl?: string | null;
  /** Cor de marca do escritor, aplicada ao botão principal. */
  accent?: string | null;
  topAction?: ReactNode;
  wide?: boolean;
  children: ReactNode;
};

/** Moldura comum das telas de entrada: formulário de um lado e cena do outro. */
export function AuthShell({
  image,
  sceneEyebrow,
  sceneTitle,
  sceneBody,
  brandName = "DevotionalApp",
  brandLogoUrl = "/AppImages/ios/192.png",
  accent,
  topAction,
  wide,
  children,
}: AuthShellProps) {
  const accentStyle = accent
    ? ({ "--reader-writer-accent": accent, "--reader-writer-on-accent": readableOn(accent) } as CSSProperties)
    : undefined;

  return (
    <div
      className="reader-premium flex min-h-screen flex-col bg-[var(--reader-bg)] text-[var(--liquid-ink)] lg:flex-row"
      style={accentStyle}
    >
      <aside className="h-28 shrink-0 sm:h-40 lg:sticky lg:top-0 lg:order-2 lg:h-screen lg:w-[46%]">
        <div className="reader-scene h-full">
          <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 46vw, 100vw" />
          <div className="hidden h-full flex-col justify-end p-12 lg:flex xl:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">{sceneEyebrow}</p>
            <h2 className="mt-4 max-w-lg text-4xl leading-[1.15] xl:text-[2.75rem]">{sceneTitle}</h2>
            {sceneBody && <div className="mt-5 max-w-md text-[15px] leading-relaxed text-white/85">{sceneBody}</div>}
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col px-5 py-5 sm:px-10 lg:px-14 lg:py-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-lg">
            {brandLogoUrl ? (
              <img src={brandLogoUrl} alt="" className="size-9 rounded-[10px] object-contain" />
            ) : (
              <span className="grid size-9 place-items-center rounded-[10px] bg-[var(--muted)] text-sm font-bold">
                {brandName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="truncate text-sm font-bold">{brandName}</span>
          </Link>
          {topAction && <div className="shrink-0 text-sm text-[var(--liquid-muted)]">{topAction}</div>}
        </header>

        <div className={cn("animate-glass-in mx-auto my-auto w-full py-9 lg:py-12", wide ? "max-w-xl" : "max-w-[26rem]")}>
          {children}
        </div>
      </main>
    </div>
  );
}

export function AuthHeading({ title, description }: { title: string; description: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-[2rem] leading-tight sm:text-[2.5rem]">{title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--liquid-muted)]">{description}</p>
    </div>
  );
}
