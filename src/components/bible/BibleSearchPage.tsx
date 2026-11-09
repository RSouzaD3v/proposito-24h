import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBooks, searchBible } from "@/lib/bible";
import { BibleTopBar, VersionSwitch, surfaceClass } from "./BibleChrome";
import { BibleSearchBox } from "./BibleSearchBox";
import { biblePath, normalizeText, parseReference, type BibleVersionCode } from "./bible-books";

/** Marca as palavras buscadas no texto, ignorando acentos e maiúsculas. */
function Emphasis({ text, query }: { text: string; query: string }) {
  const words = normalizeText(query).split(/\s+/).filter((word) => word.length >= 2);
  if (!words.length) return <>{text}</>;
  const plain = normalizeText(text);
  const marks = new Array<boolean>(text.length).fill(false);
  for (const word of words) {
    let index = plain.indexOf(word);
    while (index !== -1) {
      for (let i = index; i < index + word.length; i++) marks[i] = true;
      index = plain.indexOf(word, index + word.length);
    }
  }
  const parts: { text: string; marked: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.marked === marks[i]) last.text += text[i];
    else parts.push({ text: text[i], marked: marks[i] });
  }
  return (
    <>
      {parts.map((part, index) =>
        part.marked ? (
          <mark key={index} className="rounded-sm bg-[var(--reader-gold)]/25 px-0.5 text-inherit">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

export async function BibleSearchPage({
  version,
  query,
  page,
}: {
  version: BibleVersionCode;
  query: string;
  page: number;
}) {
  const books = (await getBooks()).map(({ abbrev, name, order }) => ({ abbrev, name, order }));
  const trimmed = query.trim();
  const results = trimmed.length >= 3 ? await searchBible(version, trimmed, page) : null;
  const reference = trimmed ? parseReference(trimmed, books) : null;
  const totalPages = results ? Math.ceil(results.total / results.pageSize) : 0;
  const pageHref = (target: number) =>
    `${biblePath(version, "busca")}?q=${encodeURIComponent(trimmed)}${target > 1 ? `&page=${target}` : ""}`;

  return (
    <>
      <BibleTopBar backHref={biblePath(version)} backLabel="Voltar para a Bíblia" title="Busca">
        <VersionSwitch current={version} hrefFor={(code) => `${biblePath(code, "busca")}?q=${encodeURIComponent(trimmed)}`} />
      </BibleTopBar>

      <BibleSearchBox key={trimmed} version={version} books={books} defaultValue={trimmed} autoFocus={!trimmed} />

      {reference && (
        <Link
          href={`${biblePath(version, reference.book.abbrev, reference.chapter)}${reference.verse ? `#v${reference.verse}` : ""}`}
          className="mt-4 flex items-center justify-between rounded-2xl bg-[var(--liquid-accent)] px-4 py-3 font-semibold text-[var(--liquid-on-accent)]"
        >
          Abrir {reference.book.name} {reference.chapter}
          {reference.verse ? `:${reference.verse}` : ""}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}

      {trimmed.length > 0 && trimmed.length < 3 && !reference && (
        <p className="mt-6 text-center text-sm text-[var(--liquid-muted)]">Digite pelo menos 3 letras para buscar.</p>
      )}

      {results && (
        <>
          <p className="mt-6 mb-3 px-1 text-[13px] text-[var(--liquid-muted)]" aria-live="polite">
            {results.total === 0
              ? `Nenhum versículo encontrado para “${trimmed}” na ${version}.`
              : `${results.total.toLocaleString("pt-BR")} ${results.total === 1 ? "versículo encontrado" : "versículos encontrados"}`}
          </p>
          <ul className="grid gap-2">
            {results.items.map((item) => (
              <li key={`${item.abbrev}-${item.chapter}-${item.verse}`}>
                <Link
                  href={`${biblePath(version, item.abbrev, item.chapter)}#v${item.verse}`}
                  className={`${surfaceClass} block p-4 transition hover:bg-[var(--muted)]/40`}
                >
                  <span className="text-xs font-bold text-[var(--reader-gold)]">
                    {item.name} {item.chapter}:{item.verse}
                  </span>
                  <span className="reader-serif mt-1 block text-[16px] leading-relaxed text-[var(--liquid-ink)]">
                    <Emphasis text={item.text} query={trimmed} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-between text-sm font-semibold" aria-label="Páginas">
              {results.page > 1 ? <Link href={pageHref(results.page - 1)}>← Anterior</Link> : <span />}
              <span className="font-normal text-[var(--liquid-muted)]">
                Página {results.page} de {totalPages}
              </span>
              {results.page < totalPages ? <Link href={pageHref(results.page + 1)}>Próxima →</Link> : <span />}
            </nav>
          )}
        </>
      )}
    </>
  );
}
