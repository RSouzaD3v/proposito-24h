"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { biblePath, findBook, parseReference, type BibleBookInfo, type BibleVersionCode } from "./bible-books";

/** Um só campo: referências ("Jo 3:16") abrem o versículo; o resto vira busca por palavras. */
export function BibleSearchBox({
  version,
  books,
  defaultValue = "",
  autoFocus,
}: {
  version: BibleVersionCode;
  books: BibleBookInfo[];
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [hint, setHint] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = value.trim();
    if (!query) return;
    const reference = parseReference(query, books);
    if (reference) {
      const hash = reference.verse ? `#v${reference.verse}` : "";
      router.push(`${biblePath(version, reference.book.abbrev, reference.chapter)}${hash}`);
      return;
    }
    const book = findBook(query, books);
    if (book) {
      router.push(biblePath(version, book.abbrev));
      return;
    }
    if (query.length < 3) {
      setHint("Digite pelo menos 3 letras.");
      return;
    }
    router.push(`${biblePath(version, "busca")}?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={submit} role="search">
      <div className="relative">
        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--liquid-muted)]" aria-hidden />
        <input
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(event) => {
            setValue(event.target.value);
            setHint(null);
          }}
          placeholder="Buscar palavra ou referência (ex.: Jo 3:16)"
          aria-label="Buscar na Bíblia"
          enterKeyHint="search"
          className="h-12 w-full rounded-2xl border border-[var(--input)] bg-[var(--reader-surface)] pr-4 pl-11 text-base text-[var(--liquid-ink)] outline-none transition placeholder:text-[var(--liquid-muted)]/80 focus-visible:border-[var(--liquid-accent)] focus-visible:ring-[3px] focus-visible:ring-[var(--liquid-accent)]/20 md:text-[15px]"
        />
      </div>
      {hint && <p className="mt-2 px-1 text-[13px] text-[var(--liquid-muted)]">{hint}</p>}
    </form>
  );
}
