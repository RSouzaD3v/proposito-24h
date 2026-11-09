import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/** Capa no formato de livro; sem imagem, mostra o título sobre uma cena. */
export function BookCover({
  title,
  coverUrl,
  className,
  compact = false,
}: {
  title: string;
  coverUrl?: string | null;
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative block aspect-[2/3] overflow-hidden rounded-xl shadow-[0_16px_32px_-14px_rgb(30_20_10_/_0.55)]",
        className,
      )}
    >
      {coverUrl ? (
        <img src={coverUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <span className="reader-scene reader-scene-night flex size-full flex-col justify-between p-3">
          <BookOpen className="size-5 text-white/80" />
          {!compact && <span className="reader-serif line-clamp-4 text-base leading-tight">{title}</span>}
        </span>
      )}
    </span>
  );
}
