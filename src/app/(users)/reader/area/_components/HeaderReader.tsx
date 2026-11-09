"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "../_contexts/AuthContext";

interface HeaderReaderProps {
  titleHeader?: string | null;
  writerName?: string | null;
  greeting: string;
  dateLabel: string;
  imageUrl?: string | null;
  next: { href: string; label: string } | null;
  finished: boolean;
}

export const HeaderReader = ({
  titleHeader,
  writerName,
  greeting,
  dateLabel,
  imageUrl,
  next,
  finished,
}: HeaderReaderProps) => {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];
  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="reader-scene reader-scene-dawn rounded-b-[2.5rem]">
      {imageUrl && <img src={imageUrl} alt="" />}
      <div className="mx-auto flex min-h-[30rem] w-full max-w-3xl flex-col justify-between px-5 pb-8 pt-4">
        <div className="flex items-center gap-3 pr-28">
          <Link
            href="/reader/area/settings"
            aria-label="Abrir configurações"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 font-semibold backdrop-blur-md transition-colors hover:bg-white/25"
          >
            {initial}
          </Link>
          {writerName && <p className="truncate text-sm font-medium text-white/85">{writerName}</p>}
        </div>

        <div className="animate-glass-in">
          <p className="text-sm text-white/80 first-letter:uppercase">{dateLabel}</p>
          <p className="mt-3 text-lg text-white/90">
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </p>
          <h1 className="mt-1 text-[2.5rem] leading-[1.08] md:text-[3.25rem]">
            {titleHeader || "Vamos passar um tempo com Deus?"}
          </h1>

          {next ? (
            <Link
              href={next.href}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#241c15] shadow-lg transition-transform motion-safe:hover:scale-[1.02]"
            >
              {next.label} <ArrowRight className="size-4" />
            </Link>
          ) : (
            finished && (
              <p className="mt-6 inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 text-sm font-semibold backdrop-blur-md">
                <Check className="size-4" /> Jornada de hoje concluída
              </p>
            )
          )}
        </div>
      </div>
    </header>
  );
};
