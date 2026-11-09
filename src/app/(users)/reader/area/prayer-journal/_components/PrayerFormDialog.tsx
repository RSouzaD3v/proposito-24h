"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { journalRequest, type PrayerEntry } from "./PrayerJournal";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

async function uploadImage(file: File): Promise<string> {
  const { url, publicUrl } = await journalRequest<{ url: string; publicUrl: string }>("/image", "POST", {
    fileName: file.name,
    contentType: file.type,
  });
  const response = await fetch(url, { method: "PUT", headers: { "Content-Type": file.type }, body: file }).catch(
    () => null,
  );
  if (!response?.ok) throw new Error("Não foi possível enviar a foto. Tente novamente.");
  return publicUrl;
}

/** O navegador só abre o calendário pelo ícone; aqui o campo inteiro abre. */
function openDatePicker(event: React.MouseEvent<HTMLInputElement>) {
  try {
    event.currentTarget.showPicker();
  } catch {
    // Sem suporte a showPicker, o campo continua funcionando do jeito nativo.
  }
}

export function PrayerFormDialog({
  entry,
  today,
  accent,
  onClose,
  onSaved,
  onDeleted,
}: {
  entry: PrayerEntry | null;
  today: string;
  accent: string;
  onClose: () => void;
  onSaved: (entry: PrayerEntry) => void;
  onDeleted: (id: string) => void;
}) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [startDate, setStartDate] = useState(entry?.startDate ?? today);
  const [savedImage, setSavedImage] = useState(entry?.imageUrl ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "deleting">("idle");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const busy = status !== "idle";
  const shownImage = preview ?? savedImage;

  function pickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    if (!IMAGE_TYPES.includes(picked.type)) {
      setError("Escolha uma foto em JPG, PNG, WEBP ou GIF.");
    } else if (picked.size > MAX_IMAGE_BYTES) {
      setError("A foto precisa ter no máximo 8 MB.");
    } else {
      setError(null);
      setFile(picked);
    }
  }

  function clearImage() {
    setFile(null);
    setSavedImage(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      let imageUrl = savedImage;
      if (file) {
        setStatus("uploading");
        imageUrl = await uploadImage(file);
      }
      setStatus("saving");
      const body = { title, notes, startDate, imageUrl };
      const saved = entry
        ? await journalRequest<PrayerEntry>(`/${entry.id}`, "PUT", body)
        : await journalRequest<PrayerEntry>("", "POST", body);
      onSaved(saved);
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  async function remove() {
    if (!entry) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setError(null);
    setStatus("deleting");
    try {
      await journalRequest<null>(`/${entry.id}`, "DELETE");
      onDeleted(entry.id);
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>{entry ? "Pedido de oração" : "Novo pedido de oração"}</DialogTitle>
          <DialogDescription>
            {entry ? "Atualize os detalhes deste pedido." : "Registre o que está no seu coração."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <input ref={fileInput} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={pickFile} />

          {shownImage ? (
            <div className="relative overflow-hidden rounded-2xl">
              <img src={shownImage} alt="Foto do pedido" className="h-48 w-full object-cover" />
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  type="button"
                  aria-label="Trocar foto"
                  disabled={busy}
                  onClick={() => fileInput.current?.click()}
                  className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <RefreshCw className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Remover foto"
                  disabled={busy}
                  onClick={clearImage}
                  className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
              className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-black/15 text-sm text-[var(--liquid-muted)] transition-colors hover:border-black/30"
            >
              <ImagePlus className="size-6" />
              <span className="font-medium">Adicionar uma foto</span>
              <span className="text-xs">Uma imagem que represente este pedido (opcional)</span>
            </button>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="prayer-title">Pelo que você está orando?</Label>
            <Input
              id="prayer-title"
              autoFocus={!entry}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="Ex.: Meu primeiro carro"
              className="h-11"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prayer-notes">Detalhes (opcional)</Label>
            <Textarea
              id="prayer-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Escreva sua oração, um versículo ou o que quiser lembrar."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prayer-date">Desde quando você ora por isso?</Label>
            <Input
              id="prayer-date"
              type="date"
              value={startDate}
              max={entry?.answeredOn ?? today}
              onChange={(event) => setStartDate(event.target.value)}
              onClick={openDatePicker}
              className="block h-11 cursor-pointer"
              required
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            {entry ? (
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={remove}
                onBlur={() => setConfirmDelete(false)}
                className="h-11 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                {status === "deleting" ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {confirmDelete ? "Confirmar exclusão" : "Excluir"}
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              variant="glass-primary"
              disabled={busy}
              className="h-11 rounded-full px-6"
              style={{ backgroundColor: accent }}
            >
              {(status === "uploading" || status === "saving") && <Loader2 className="size-4 animate-spin" />}
              {status === "uploading" ? "Enviando foto..." : status === "saving" ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
