import Link from "next/link";
import { CalendarCheck, Highlighter } from "lucide-react";
import { getBooks } from "@/lib/bible";
import { BibleTopBar, VersionSwitch } from "./BibleChrome";
import { BibleSearchBox } from "./BibleSearchBox";
import { BookBrowser } from "./BookBrowser";
import { ContinueReading } from "./ContinueReading";
import { VERSIONS, biblePath, type BibleVersionCode } from "./bible-books";

const shortcutClass =
  "flex items-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] px-4 py-3 text-sm font-semibold text-[var(--liquid-ink)] transition hover:bg-[var(--muted)]/50";

export async function BibleHome({ version }: { version: BibleVersionCode }) {
  const books = (await getBooks()).map(({ abbrev, name, order }) => ({ abbrev, name, order }));
  const versionName = VERSIONS.find((item) => item.code === version)?.name;

  return (
    <>
      <BibleTopBar backHref="/reader/area" backLabel="Voltar para o início">
        <VersionSwitch current={version} hrefFor={(code) => biblePath(code)} />
      </BibleTopBar>

      <h1 className="text-[2rem] leading-tight text-[var(--liquid-ink)]">Bíblia</h1>
      <p className="mt-1 mb-6 text-sm text-[var(--liquid-muted)]">{versionName}</p>

      <div className="grid gap-4">
        <BibleSearchBox version={version} books={books} />
        <ContinueReading version={version} />
        <div className="grid grid-cols-2 gap-2">
          <Link href={biblePath(version, "destaques")} className={shortcutClass}>
            <Highlighter className="size-4 shrink-0 text-[var(--reader-gold)]" aria-hidden />
            Meus destaques
          </Link>
          <Link href="/reader/area/reading/plan/365" className={shortcutClass}>
            <CalendarCheck className="size-4 shrink-0 text-[var(--reader-gold)]" aria-hidden />
            Plano de leitura
          </Link>
        </div>
      </div>

      <div className="mt-9">
        <BookBrowser version={version} books={books} />
      </div>
    </>
  );
}
