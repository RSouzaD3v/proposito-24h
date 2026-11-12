import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";

const linkClass = "rounded-md text-sm font-semibold text-white/85 transition-colors hover:text-white";

export const Header = ({
  logo,
  name,
  showPlatformLinks,
}: {
  logo?: string | null;
  name: string;
  showPlatformLinks?: boolean;
}) => {
  return (
    <header className="absolute inset-x-0 top-0 z-20 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-lg">
          {logo ? (
            <OptimizedImage src={logo} alt="" width={40} height={40} className="size-10 rounded-xl object-contain" />
          ) : (
            <span className="grid size-10 place-items-center rounded-xl bg-white/15 font-bold">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate font-bold">{name}</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-5 sm:gap-7" aria-label="Principal">
          {showPlatformLinks && (
            <Link href="/docs" className={`${linkClass} hidden sm:inline`}>
              Documentação
            </Link>
          )}
          <Link href="/bible-nvi" className={linkClass}>
            Bíblia
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/35 px-4 py-2 text-sm font-bold transition-colors hover:bg-white hover:text-[#241c15]"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
};
