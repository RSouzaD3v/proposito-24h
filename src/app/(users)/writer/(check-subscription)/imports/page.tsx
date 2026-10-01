"use client";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ButtonSpinner } from "@/components/ui/loading-state";
import { useState, useMemo } from "react";

type Kind = "devotional" | "quote" | "verse" | "prayer";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resp, setResp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<Kind>("devotional");

  const endpoint = useMemo(() => `/api/massive/${kind}s/import`, [kind]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResp(null);
    setError(null);

    // 60s de timeout ajuda a não “pendurar” em prod
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 60_000);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const r = await fetch(endpoint, { method: "POST", body: fd, signal: controller.signal });

      // tenta parsear JSON mesmo em erro
      const text = await r.text();
      let j: any;
      try {
        j = JSON.parse(text);
      } catch {
        j = { error: "Resposta não é JSON", raw: text };
      }

      if (!r.ok) {
        setError(j?.error || `Falha no upload (${r.status})`);
        setResp(j);
      } else {
        setResp(j);
        // opcional: limpa o input após sucesso
        setFile(null);
      }
    } catch (err: any) {
      setError(err?.name === "AbortError" ? "Tempo esgotado (timeout)." : (err?.message || "Erro desconhecido."));
    } finally {
      clearTimeout(to);
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center liquid-shell liquid-bg px-4 py-8">
      <BackButton href="/writer/daily" label="Voltar ao Diário" className="absolute top-4 left-4" />

      <GlassCard className="w-full max-w-md space-y-6" padding="lg">
        <h1 className="text-2xl font-bold text-[var(--liquid-ink)] text-center mb-2">Importar Arquivo</h1>

        {/* Links de exemplos */}
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[var(--liquid-muted)]">Baixe um modelo de exemplo:</span>
          <a href="/spreadsheets/devocional-exemplo.xlsx" download="devocional-exemplo.xlsx" className="text-[var(--liquid-accent)] hover:underline">
            📘 Devocional (exemplo)
          </a>
          <a href="/spreadsheets/citacao-exemplo.xlsx" download="citacao-exemplo.xlsx" className="text-[var(--liquid-accent)] hover:underline">
            💬 Citação (exemplo)
          </a>
          <a href="/spreadsheets/versiculo-exemplo.xlsx" download="versiculo-exemplo.xlsx" className="text-[var(--liquid-accent)] hover:underline">
            ✝️ Versículo (exemplo)
          </a>
          <a href="/spreadsheets/oracao-exemplo.xlsx" download="oracao-exemplo.xlsx" className="text-[var(--liquid-accent)] hover:underline">
            🙏 Oração/Prayer (exemplo)
          </a>
        </div>

        {/* Select de tipo */}
        <div className="flex justify-center">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
            className="border border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="devotional">Devocional</option>
            <option value="quote">Citação</option>
            <option value="verse">Versículo</option>
            <option value="prayer">Oração (Prayer)</option>
          </select>
        </div>

        {/* Upload */}
        <form onSubmit={handleUpload} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-[var(--liquid-muted)] mb-1">Arquivo (.xls, .xlsx)</span>
            <input
              key={file ? file.name : "empty"} // força reset visual ao limpar
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
            />
            {file && (
              <span className="mt-1 block text-xs text-gray-500">
                Selecionado: <strong>{file.name}</strong>
              </span>
            )}
          </label>

          <Button
            type="submit"
            disabled={!file || loading}
            variant="glass-primary"
            className="w-full rounded-full"
          >
            {loading && <ButtonSpinner />}
            {loading ? "Enviando..." : "Enviar"}
          </Button>
        </form>

        {/* Erro */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Resposta */}
        {resp && (
          <div className="mt-2">
            <span className="block text-sm font-medium text-[var(--liquid-muted)] mb-1">Resposta:</span>
            <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
              {JSON.stringify(resp, null, 2)}
            </pre>
          </div>
        )}

        {/* Endpoint debug */}
        <p className="text-[11px] text-gray-400 text-center">POST {endpoint}</p>
      </GlassCard>
    </main>
  );
}
