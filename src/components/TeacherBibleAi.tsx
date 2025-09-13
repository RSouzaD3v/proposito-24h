"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, X, Minus, Maximize2, MessageCircle } from "lucide-react";

export default function TeacherBibleAI({
  initialPrompt = "Explique Gênesis em poucas palavras",
}: {
  initialPrompt?: string;
}) {
  const [open, setOpen] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleAsk() {
    if (!prompt?.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setAnswer("");
    try {
      const res = await fetch("/api/ai/teacher-bible-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao gerar explicação.");
      setAnswer(data.text || "");
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  // Minimizado: mostra só um botão no canto direito
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          className="rounded-full shadow-lg"
          size="icon"
          onClick={() => {
            setMinimized(false);
            setOpen(true);
          }}
          aria-label="Abrir Professor"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Container flutuante centralizado no rodapé */}
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center pointer-events-none">
        <Card
          className={`pointer-events-auto w-[min(720px,calc(100vw-1.5rem))] shadow-2xl border-2 backdrop-blur bg-background/95 ${
            open ? "" : "overflow-hidden"
          }`}
        >
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Pergunte ao Professor
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                aria-label={open ? "Minimizar" : "Expandir"}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <Minus className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Fechar"
                onClick={() => {
                  setOpen(false);
                  setMinimized(true);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {open && (
            <CardContent className="px-4 pb-4 pt-0">
              <div className="grid gap-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Digite sua dúvida (ex.: Explique Gênesis 1)…"
                  className="min-h-20"
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Dica: <kbd>Ctrl</kbd>+<kbd>Enter</kbd> para enviar
                  </span>
                  <Button onClick={handleAsk} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando…
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Explicar
                      </>
                    )}
                  </Button>
                </div>

                {errorMsg && (
                  <div className="text-sm text-destructive">{errorMsg}</div>
                )}

                {answer && (
                  <div className="mt-1 rounded-md border p-3 max-h-56 overflow-auto prose prose-sm dark:prose-invert">
                    {answer}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}
