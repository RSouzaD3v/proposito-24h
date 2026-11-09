"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { journalRequest, type PrayerEntry } from "./PrayerJournal";

export function ThanksDialog({
  entry,
  fresh,
  accent,
  onClose,
  onSaved,
}: {
  entry: PrayerEntry;
  /** O pedido acabou de ser marcado como respondido. */
  fresh: boolean;
  accent: string;
  onClose: () => void;
  onSaved: (entry: PrayerEntry) => void;
}) {
  const [text, setText] = useState(entry.thanksPrayer ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      onSaved(await journalRequest<PrayerEntry>(`/${entry.id}/thanks`, "PUT", { thanksPrayer: text }));
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>{fresh ? "Glória a Deus!" : "Oração de agradecimento"}</DialogTitle>
          <DialogDescription>
            {fresh ? `“${entry.title}” foi respondida. Que tal agradecer em oração?` : `Pelo pedido “${entry.title}”.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="thanks-prayer">Sua oração de agradecimento</Label>
            <Textarea
              id="thanks-prayer"
              autoFocus
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={2000}
              rows={6}
              placeholder="Senhor, eu te agradeço porque..."
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" disabled={saving} onClick={onClose} className="h-11 rounded-full">
              {fresh ? "Agora não" : "Cancelar"}
            </Button>
            <Button
              type="submit"
              variant="glass-primary"
              disabled={saving || (!text.trim() && !entry.thanksPrayer)}
              className="h-11 rounded-full px-6"
              style={{ backgroundColor: accent }}
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? "Salvando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
