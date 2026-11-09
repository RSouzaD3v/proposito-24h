"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Check, CloudOff, ImagePlus, Loader2, Maximize2, Minimize2, Trash2 } from "lucide-react";
import WriterAiButton from "@/components/WriterAi";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { DevicePreview } from "@/components/writer/DevicePreview";
import { uploadImage } from "@/lib/uploadImage";
import { cn } from "@/lib/utils";

const RichEditor = dynamic(() => import("./RichEditor"), {
  ssr: false,
  loading: () => <div className="min-h-[320px] animate-pulse rounded-lg border bg-white p-4 shadow-sm" />,
});

type Draft = { title: string; subtitle: string; coverUrl: string; order: number; content: string };
type Stored = { draft: Draft; savedAt: number };
type Status = "clean" | "dirty" | "saving" | "saved" | "error";
type View = "write" | "split" | "preview";
type Publication = { id: string; slug: string; title: string; status: string };
type ChapterRow = { id: string; order: number; title: string; subtitle: string | null; coverUrl: string | null; content: string; updatedAt: string };

const AUTOSAVE_MS = 2500;
const LOCAL_SAVE_MS = 600;
const PREVIEW_MS = 250;
const WORDS_PER_MINUTE = 200;

const plainText = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
const countWords = (html: string) => {
  const text = plainText(html);
  return text ? text.split(/\s+/).length : 0;
};
const canSave = (draft: Draft) => Boolean(draft.title.trim() && plainText(draft.content));
const apiError = async (response: Response) => {
  const body = await response.json().catch(() => null);
  return Array.isArray(body?.message) ? body.message[0] : body?.message;
};

const VIEWS: { key: View; label: string; wideOnly?: boolean }[] = [
  { key: "write", label: "Escrever" },
  { key: "split", label: "Lado a lado", wideOnly: true },
  { key: "preview", label: "Prévia" },
];

export default function ChapterStudio({ slug, chapterId: initialId }: { slug: string; chapterId?: string }) {
  const [publication, setPublication] = useState<Publication | null>(null);
  const [position, setPosition] = useState(0);
  const [draft, setDraft] = useState<Draft>({ title: "", subtitle: "", coverUrl: "", order: 1, content: "" });
  const [loadError, setLoadError] = useState("");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<Status>("clean");
  const [saveError, setSaveError] = useState("");
  const [restorable, setRestorable] = useState<Stored | null>(null);
  const [view, setView] = useState<View>("write");
  const [focus, setFocus] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);

  const draftRef = useRef(draft);
  const savedRef = useRef("");
  const idRef = useRef(initialId);
  const inFlight = useRef(false);
  const saveAgain = useRef(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  draftRef.current = draft;
  const published = publication?.status === "PUBLISHED";
  const chaptersHref = `/writer/publications/${slug}/chapters`;
  const storageKey = useCallback(() => `writer:chapter:${slug}:${idRef.current ?? "new"}`, [slug]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [pubsResponse, chaptersResponse] = await Promise.all([
          fetch("/api/v1/writer/publications"),
          fetch(`/api/v1/writer/publications/${encodeURIComponent(slug)}/chapters`),
        ]);
        if (!pubsResponse.ok || !chaptersResponse.ok) throw new Error();
        const publications: Publication[] = await pubsResponse.json();
        const chapters: ChapterRow[] = await chaptersResponse.json();
        const current = publications.find((item) => item.slug === slug);
        const chapter = chapters.find(({ id }) => id === initialId);
        if (!current || (initialId && !chapter)) throw new Error();
        if (!active) return;

        const loaded: Draft = chapter
          ? {
              title: chapter.title,
              subtitle: chapter.subtitle ?? "",
              coverUrl: chapter.coverUrl ?? "",
              order: chapter.order,
              content: chapter.content,
            }
          : {
              title: "",
              subtitle: "",
              coverUrl: "",
              order: Math.max(0, ...chapters.map(({ order }) => order)) + 1,
              content: "",
            };

        savedRef.current = JSON.stringify(loaded);
        setPublication(current);
        setPosition(chapter ? chapters.indexOf(chapter) : chapters.length);
        setDraft(loaded);

        try {
          const raw = localStorage.getItem(`writer:chapter:${slug}:${initialId ?? "new"}`);
          const stored: Stored | null = raw ? JSON.parse(raw) : null;
          const newer = stored && (!chapter || stored.savedAt > new Date(chapter.updatedAt).getTime());
          if (stored && newer && JSON.stringify(stored.draft) !== savedRef.current) setRestorable(stored);
        } catch {
          // Sem armazenamento local, o capítulo abre como está no servidor.
        }
        setReady(true);
      } catch {
        if (active) setLoadError("Não foi possível abrir este capítulo.");
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, initialId]);

  const persist = useCallback(async () => {
    if (inFlight.current) {
      saveAgain.current = true;
      return;
    }
    const snapshot = draftRef.current;
    const body = JSON.stringify(snapshot);
    if (body === savedRef.current) return;
    if (!canSave(snapshot)) {
      setSaveError("Dê um título e escreva o texto antes de salvar.");
      setStatus("error");
      return;
    }

    inFlight.current = true;
    setStatus("saving");
    setSaveError("");
    try {
      const id = idRef.current;
      const base = `/api/v1/writer/publications/${encodeURIComponent(slug)}/chapters`;
      const response = await fetch(id ? `${base}/${id}` : base, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...snapshot, subtitle: snapshot.subtitle || null, coverUrl: snapshot.coverUrl || null }),
      });
      if (!response.ok) throw new Error((await apiError(response)) || "Não foi possível salvar.");

      if (!id) {
        const created: { id: string } = await response.json();
        localStorage.removeItem(storageKey());
        idRef.current = created.id;
        // Troca só o endereço: remontar a página tiraria o cursor de quem está digitando.
        window.history.replaceState(null, "", `/writer/publications/${slug}/chapters/${created.id}`);
      }
      savedRef.current = body;
      localStorage.removeItem(storageKey());
      setStatus(JSON.stringify(draftRef.current) === body ? "saved" : "dirty");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Não foi possível salvar.");
      setStatus("error");
    } finally {
      inFlight.current = false;
      if (saveAgain.current) {
        saveAgain.current = false;
        void persist();
      }
    }
  }, [slug, storageKey]);

  const sendToPreview = useCallback(() => {
    const { title, subtitle, content, coverUrl } = draftRef.current;
    frameRef.current?.contentWindow?.postMessage(
      {
        type: "writer-preview:chapter",
        chapter: { title: title || "Sem título", subtitle, content, coverUrl: coverUrl || undefined },
      },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    if (!ready) return;
    const dirty = JSON.stringify(draft) !== savedRef.current;
    if (dirty) setStatus((current) => (current === "saving" ? current : "dirty"));

    const local = setTimeout(() => {
      try {
        if (dirty) localStorage.setItem(storageKey(), JSON.stringify({ draft, savedAt: Date.now() } satisfies Stored));
        else localStorage.removeItem(storageKey());
      } catch {
        // O salvamento no servidor continua disponível.
      }
    }, LOCAL_SAVE_MS);
    const preview = setTimeout(sendToPreview, PREVIEW_MS);
    // Capítulo não tem rascunho próprio: em livro publicado, gravar agora mostraria texto pela metade ao leitor.
    const remote = dirty && !published && canSave(draft) ? setTimeout(persist, AUTOSAVE_MS) : undefined;

    return () => {
      clearTimeout(local);
      clearTimeout(preview);
      clearTimeout(remote);
    };
  }, [draft, ready, published, persist, sendToPreview, storageKey]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === "writer-preview:ready") sendToPreview();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendToPreview]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void persist();
      }
      if (event.key === "Escape") setFocus(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [persist]);

  const pending = status === "dirty" || status === "saving" || status === "error";
  useEffect(() => {
    if (!pending) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pending]);

  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  async function changeCover(file: File | undefined) {
    if (!file) return;
    setCoverBusy(true);
    setSaveError("");
    try {
      update({ coverUrl: await uploadImage(file, "cover-chapters") });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "O envio da capa falhou.");
    } finally {
      setCoverBusy(false);
    }
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-lg text-[var(--liquid-ink)]">{loadError}</p>
        <Button asChild variant="glass" className="rounded-full">
          <Link href={chaptersHref}>Voltar aos capítulos</Link>
        </Button>
      </div>
    );
  }
  if (!ready || !publication) return <LoadingState variant="full" label="Abrindo capítulo..." />;

  const words = countWords(draft.content);
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  const statusLabel = {
    clean: "Tudo salvo",
    saved: published ? "Publicado" : "Salvo",
    saving: "Salvando...",
    dirty: published ? "Alterações não publicadas" : "Salvando em instantes...",
    error: "Não salvo",
  }[status];
  const StatusIcon = status === "saving" ? Loader2 : status === "error" || (status === "dirty" && published) ? CloudOff : Check;
  const showEditor = view !== "preview";
  const showPreview = view !== "write";

  const preview = (
    <DevicePreview
      src={`/writer/preview/book/${publication.id}?chapter=${position}`}
      frameRef={frameRef}
      className="h-full"
    />
  );

  return (
    <div className={cn("flex min-h-screen flex-col", focus && "fixed inset-0 z-50 overflow-y-auto bg-[#f6f1e7]")}>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 md:px-5">
          <Link
            href={chaptersHref}
            aria-label="Voltar aos capítulos"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--liquid-ink)] hover:bg-black/5"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--liquid-ink)]">{publication.title}</p>
            <p className="flex items-center gap-1.5 text-xs text-[var(--liquid-muted)]" role="status">
              <StatusIcon className={cn("size-3.5", status === "saving" && "animate-spin")} aria-hidden />
              {statusLabel}
              <span aria-hidden>·</span>
              {words.toLocaleString("pt-BR")} {words === 1 ? "palavra" : "palavras"}
              <span aria-hidden>·</span>
              {minutes} min de leitura
            </p>
          </div>

          {!focus && (
            <div className="flex items-center gap-0.5 rounded-full bg-black/5 p-1">
              {VIEWS.map(({ key, label, wideOnly }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={view === key}
                  onClick={() => setView(key)}
                  className={cn(
                    "h-8 rounded-full px-3 text-xs font-semibold transition-colors",
                    wideOnly && "hidden lg:block",
                    view === key ? "bg-white text-[var(--liquid-ink)] shadow-sm" : "text-[var(--liquid-muted)]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            aria-label={focus ? "Sair do modo foco" : "Modo foco"}
            title={focus ? "Sair do modo foco (Esc)" : "Modo foco"}
            onClick={() => {
              setFocus((value) => !value);
              setView("write");
            }}
            className="flex size-10 items-center justify-center rounded-full text-[var(--liquid-ink)] hover:bg-black/5"
          >
            {focus ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          <Button
            type="button"
            variant="glass-primary"
            className="rounded-full px-5"
            disabled={status === "saving" || status === "clean" || status === "saved"}
            onClick={() => void persist()}
            title="Ctrl+S"
          >
            {published ? "Publicar alterações" : "Salvar"}
          </Button>
        </div>
      </header>

      {saveError && (
        <p role="alert" className="bg-red-50 px-5 py-2 text-center text-sm text-red-800">
          {saveError}
        </p>
      )}

      {restorable && (
        <div className="flex flex-wrap items-center justify-center gap-3 bg-amber-50 px-5 py-2 text-sm text-amber-950">
          <span>Encontramos um texto não salvo de {new Date(restorable.savedAt).toLocaleString("pt-BR")}.</span>
          <button
            type="button"
            className="font-bold underline"
            onClick={() => {
              setDraft(restorable.draft);
              setRestorable(null);
            }}
          >
            Recuperar
          </button>
          <button
            type="button"
            className="underline"
            onClick={() => {
              localStorage.removeItem(storageKey());
              setRestorable(null);
            }}
          >
            Descartar
          </button>
        </div>
      )}

      {published && !focus && (
        <p className="bg-blue-50 px-5 py-2 text-center text-xs text-blue-950">
          Este livro já está publicado. O que você escreve fica guardado neste navegador e só chega aos leitores ao clicar em{" "}
          <strong>Publicar alterações</strong>.
        </p>
      )}

      <div className={cn("flex min-h-0 flex-1", view === "split" && "lg:grid lg:grid-cols-2")}>
        {showEditor && (
          <main className={cn("w-full px-4 pb-20 pt-8 md:px-8", view === "split" && "overflow-y-auto lg:h-[calc(100vh-3.6rem)]")}>
            <div className="mx-auto max-w-3xl">
              <input
                aria-label="Título do capítulo"
                value={draft.title}
                onChange={(event) => update({ title: event.target.value })}
                placeholder="Título do capítulo"
                maxLength={300}
                className="w-full bg-transparent font-serif text-3xl font-bold text-[var(--liquid-ink)] outline-none placeholder:text-black/25 md:text-4xl"
              />
              <input
                aria-label="Subtítulo do capítulo"
                value={draft.subtitle}
                onChange={(event) => update({ subtitle: event.target.value })}
                placeholder="Subtítulo (opcional)"
                maxLength={500}
                className="mt-2 w-full bg-transparent font-serif text-lg italic text-[var(--liquid-muted)] outline-none placeholder:text-black/25"
              />

              {!focus && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 text-sm font-medium text-[var(--liquid-ink)] hover:bg-white">
                    {coverBusy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                    {draft.coverUrl ? "Trocar capa" : "Adicionar capa"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={coverBusy}
                      onChange={(event) => changeCover(event.target.files?.[0])}
                    />
                  </label>
                  {draft.coverUrl && (
                    <span className="flex items-center gap-2">
                      <img src={draft.coverUrl} alt="Capa do capítulo" className="h-10 w-16 rounded-md object-cover" />
                      <button
                        type="button"
                        aria-label="Remover capa"
                        onClick={() => update({ coverUrl: "" })}
                        className="flex size-9 items-center justify-center rounded-full text-[var(--liquid-muted)] hover:bg-black/5"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  )}
                  <label className="flex items-center gap-2 text-sm text-[var(--liquid-muted)]">
                    Posição
                    <input
                      type="number"
                      min={1}
                      value={draft.order}
                      onChange={(event) => update({ order: event.target.valueAsNumber || 1 })}
                      className="h-10 w-20 rounded-lg border border-black/10 bg-white/70 px-3 text-[var(--liquid-ink)]"
                    />
                  </label>
                  <div className="ml-auto">
                    <WriterAiButton
                      onInsert={(text) =>
                        setDraft((current) => ({
                          ...current,
                          content: `${current.content}<p>${text.replace(/\n/g, "<br/>")}</p>`,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              <div className="mt-6">
                <RichEditor
                  value={draft.content}
                  onChange={(content) => update({ content })}
                  toolbarClassName="top-16"
                />
              </div>
            </div>
          </main>
        )}

        {showPreview && (
          <aside className={cn("w-full bg-black/[0.03] p-4", view === "split" ? "hidden lg:block lg:h-[calc(100vh-3.6rem)]" : "h-[calc(100vh-3.6rem)]")}>
            {preview}
          </aside>
        )}
      </div>
    </div>
  );
}
