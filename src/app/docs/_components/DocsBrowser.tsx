"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import type { DocSection, DocTopic } from "../_content";

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const searchableText = (topic: DocTopic) =>
  normalize([topic.title, topic.summary, topic.note ?? "", ...(topic.steps ?? [])].join(" "));

function Topic({
  topic,
  open,
  onToggle,
}: {
  topic: DocTopic;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
}) {
  return (
    <details
      id={topic.id}
      open={open}
      onToggle={(event) => onToggle(topic.id, event.currentTarget.open)}
      className="group scroll-mt-6 border-b border-[var(--border)] last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
        {topic.title}
        <ChevronDown
          className="size-4 shrink-0 text-[var(--liquid-muted)] transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="grid gap-3 pb-5 text-[15px] leading-relaxed text-[var(--liquid-muted)]">
        <p>{topic.summary}</p>
        {topic.steps && (
          <ol className="grid gap-2">
            {topic.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="reader-serif w-4 shrink-0 text-[var(--reader-gold)]">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
        {topic.note && <p className="rounded-xl bg-[var(--muted)]/60 px-3.5 py-2.5 text-sm">{topic.note}</p>}
        {topic.link && (
          <Link
            href={topic.link.href}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-[var(--liquid-ink)] underline decoration-[var(--reader-gold)] underline-offset-4"
          >
            {topic.link.label}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </details>
  );
}

export function DocsBrowser({ sections }: { sections: DocSection[] }) {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const term = normalize(query.trim());
  const searching = term.length > 0;

  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      setOpenIds((current) => new Set(current).add(id));
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  const visibleSections = useMemo(() => {
    if (!searching) return sections;
    return sections
      .map((section) => ({
        ...section,
        topics: section.topics.filter((topic) => searchableText(topic).includes(term)),
      }))
      .filter((section) => section.topics.length > 0);
  }, [sections, searching, term]);

  const toggle = (id: string, isOpen: boolean) => {
    if (searching) return;
    setOpenIds((current) => {
      if (current.has(id) === isOpen) return current;
      const next = new Set(current);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
      <nav aria-label="Seções" className="hidden lg:block">
        <ul className="sticky top-6 grid gap-1 text-sm">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#secao-${section.id}`}
                onClick={() => setQuery("")}
                className="block rounded-lg px-3 py-2 font-medium text-[var(--liquid-muted)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--liquid-ink)]"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--liquid-muted)]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar na ajuda"
            aria-label="Buscar na ajuda"
            className="h-12 w-full rounded-xl border border-[var(--input)] bg-[var(--reader-surface)] pr-4 pl-11 text-base outline-none transition focus-visible:border-[var(--liquid-accent)] focus-visible:ring-[3px] focus-visible:ring-[var(--liquid-accent)]/20 md:text-[15px]"
          />
        </div>

        {visibleSections.length === 0 && (
          <p className="mt-10 text-center text-[15px] text-[var(--liquid-muted)]" role="status">
            Nada encontrado para “{query.trim()}”. Tente outra palavra.
          </p>
        )}

        <div className="mt-8 grid gap-9">
          {visibleSections.map((section) => (
            <section key={section.id} id={`secao-${section.id}`} className="scroll-mt-6">
              <h2 className="mb-1 text-xl">{section.title}</h2>
              <div>
                {section.topics.map((topic) => (
                  <Topic key={topic.id} topic={topic} open={searching || openIds.has(topic.id)} onToggle={toggle} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
