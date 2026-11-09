"use client";

import { useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatMonthYear,
  profilePath,
  type DirectoryWriter,
  type WriterProfileData,
} from "../_lib/directory";
import { WriterAvatar, WriterMetrics, WriterProfile } from "./WriterProfile";

const NEW_WRITER_MS = 30 * 24 * 60 * 60 * 1000;

function WriterCard({ writer, onOpen }: { writer: DirectoryWriter; onOpen: (event: MouseEvent, writer: DirectoryWriter) => void }) {
  const name = writer.name.trim();
  const isNew = Date.now() - new Date(writer.createdAt).getTime() < NEW_WRITER_MS;

  return (
    <li>
      <Link
        href={profilePath(writer.slug)}
        onClick={(event) => onOpen(event, writer)}
        className="flex h-full flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--reader-gold)] hover:shadow-[var(--glass-shadow)]"
      >
        <div className="flex items-center gap-3">
          <WriterAvatar name={name} logoUrl={writer.logoUrl} size="size-14" pixels={56} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2">
              <span className="reader-serif truncate text-lg">{name}</span>
              {isNew && (
                <span className="shrink-0 rounded-full bg-[var(--reader-gold)]/15 px-2 py-0.5 text-[11px] font-bold text-[var(--reader-gold)]">
                  Novo
                </span>
              )}
            </p>
            <p className="text-[13px] text-[var(--liquid-muted)]">Desde {formatMonthYear(writer.createdAt)}</p>
          </div>
        </div>

        <div className="mt-auto">
          <WriterMetrics counts={writer} />
        </div>
      </Link>
    </li>
  );
}

export function WriterGrid({ writers }: { writers: DirectoryWriter[] }) {
  const [selected, setSelected] = useState<DirectoryWriter | null>(null);
  const [profile, setProfile] = useState<WriterProfileData | null>(null);
  const [failed, setFailed] = useState(false);
  const request = useRef<AbortController | null>(null);

  const open = (event: MouseEvent, writer: DirectoryWriter) => {
    // Ctrl/Cmd+clique continua abrindo a página própria em outra aba.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    setSelected(writer);
    setProfile(null);
    setFailed(false);
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    fetch(`/api/v1/public/directory/writers/${encodeURIComponent(writer.slug)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then(setProfile)
      .catch((error) => {
        if (error.name !== "AbortError") setFailed(true);
      });
  };

  const close = () => {
    request.current?.abort();
    setSelected(null);
  };

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {writers.map((writer) => (
          <WriterCard key={writer.id} writer={writer} onOpen={open} />
        ))}
      </ul>

      <Dialog open={!!selected} onOpenChange={(isOpen) => !isOpen && close()}>
        <DialogContent className="reader-premium max-h-[90svh] grid-cols-[minmax(0,1fr)] overflow-y-auto rounded-3xl bg-[var(--reader-bg)] text-[var(--liquid-ink)] sm:max-w-xl">
          <DialogTitle className="sr-only">{selected?.name.trim()}</DialogTitle>
          <DialogDescription className="sr-only">Prévia do escritor e opções de cadastro</DialogDescription>
          {profile ? (
            <WriterProfile writer={profile} />
          ) : failed && selected ? (
            <p className="py-6 text-center text-sm text-[var(--liquid-muted)]">
              Não foi possível carregar agora.{" "}
              <Link href={profilePath(selected.slug)} className="font-semibold underline underline-offset-4">
                Abrir a página do escritor
              </Link>
            </p>
          ) : (
            <div className="grid gap-5" role="status" aria-label="Carregando">
              <div className="flex items-center gap-4">
                <Skeleton className="size-20 rounded-2xl" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className="h-7 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
