"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface WriterAiButtonProps {
  onInsert?: (text: string) => void;
  className?: string;
}

const SUGGESTIONS = [
  "Um parágrafo de abertura sobre esperança em tempos difíceis",
  "Uma reflexão curta sobre Salmos 23",
  "Uma oração final para encerrar o capítulo",
];

function extractTextFromAny(data: any): string | null {
  if (typeof data?.result === "string") return data.result;
  if (typeof data?.text === "string") return data.text;
  const openai = data?.choices?.[0]?.message?.content;
  if (typeof openai === "string") return openai;
  const openaiLegacy = data?.choices?.[0]?.text;
  if (typeof openaiLegacy === "string") return openaiLegacy;
  const parts = data?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const joined = parts
      .map((p: any) => p?.text)
      .filter((t: any) => typeof t === "string" && t.trim().length > 0)
      .join("\n");
    if (joined) return joined;
  }
  if (typeof data?.output === "string") return data.output;
  if (typeof data === "string") return data;
  return null;
}

export default function WriterAiButton({ onInsert, className }: WriterAiButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = idea.trim().length >= 3 && !loading;

  const generate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/ai/writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: idea.trim() }),
      });
      if (!response.ok) {
        setError("Não foi possível gerar o texto agora. Tente novamente em instantes.");
        return;
      }
      const text = extractTextFromAny(await response.json());
      if (!text?.trim()) {
        setError("A IA não retornou texto. Tente descrever a ideia de outro jeito.");
        return;
      }
      onInsert?.(text.trim());
      setIsOpen(false);
      setIdea("");
    } catch {
      setError("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (loading) return;
        setIsOpen(open);
        if (!open) setError(null);
      }}
    >
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 text-white shadow-[0_6px_18px_rgb(79_70_229_/_0.3)] hover:opacity-95",
          className,
        )}
      >
        <Sparkles className="size-4" aria-hidden />
        Escrever com IA
      </Button>

      <DialogContent className="gap-5 rounded-3xl border-black/5 bg-white p-6 sm:max-w-lg">
        <DialogHeader className="gap-3 text-left">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <DialogTitle className="text-xl tracking-tight text-[var(--liquid-ink)]">Escrever com IA</DialogTitle>
          <DialogDescription className="text-[var(--liquid-muted)]">
            Descreva o que você quer escrever. O texto gerado entra no final do capítulo e você pode editá-lo à vontade.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <label htmlFor="writer-ai-idea" className="text-sm font-medium text-[var(--liquid-ink)]">
            Sua ideia
          </label>
          <textarea
            id="writer-ai-idea"
            autoFocus
            rows={4}
            value={idea}
            disabled={loading}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                void generate();
              }
            }}
            placeholder="Ex.: uma reflexão sobre perdão a partir de Mateus 18"
            className="w-full resize-none rounded-2xl border border-black/10 bg-[#f8f8fa] px-4 py-3 text-[15px] text-[var(--liquid-ink)] outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 disabled:opacity-60"
          />
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={loading}
                onClick={() => setIdea(suggestion)}
                className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-[var(--liquid-muted)] transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:items-center">
          <span className="mr-auto hidden text-xs text-[var(--liquid-muted)] sm:block">Ctrl + Enter para gerar</span>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full px-5"
            disabled={loading}
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void generate()}
            disabled={!canSubmit}
            className="h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 text-white hover:opacity-95"
          >
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
            {loading ? "Gerando..." : "Gerar texto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
