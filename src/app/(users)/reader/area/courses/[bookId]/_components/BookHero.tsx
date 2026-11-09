import { BackButton } from "@/components/ui/back-button";
import { BookCover } from "../../_components/BookCover";

export function BookHero({
  title,
  subtitle,
  coverUrl,
  meta,
  backHref = "/reader/area/courses",
}: {
  title: string;
  subtitle?: string | null;
  coverUrl?: string | null;
  meta?: string;
  backHref?: string;
}) {
  return (
    <header className="reader-scene reader-scene-night rounded-b-[2.5rem]">
      {coverUrl && <img src={coverUrl} alt="" className="scale-125 blur-2xl" />}
      <div className="mx-auto flex w-full max-w-2xl flex-col px-5 pb-9 pt-4">
        <BackButton href={backHref} label="Biblioteca" className="self-start" />
        <div className="mt-6 flex flex-col items-center text-center animate-glass-in">
          <BookCover title={title} coverUrl={coverUrl} className="w-40 rounded-2xl shadow-[0_24px_50px_-14px_rgb(0_0_0_/_0.7)] md:w-48" />
          <h1 className="mt-6 text-[2rem] leading-[1.12] md:text-[2.75rem]">{title}</h1>
          {subtitle && <p className="reader-serif mt-2 text-lg italic text-white/85">{subtitle}</p>}
          {meta && <p className="mt-3 text-xs font-semibold text-white/75">{meta}</p>}
        </div>
      </div>
    </header>
  );
}
