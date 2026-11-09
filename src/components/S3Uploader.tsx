"use client";

import { useState } from "react";

type Props = {
  folder?: string; // ex: `writers/${writerId}` ou `uploads`
  onUploaded?: (fileInfo: { key: string; publicUrl: string }) => void;
  /** Mostra apenas um botão, para formulários que exibem a própria prévia. */
  compact?: boolean;
};

export default function S3Uploader({ folder, onUploaded, compact }: Props) {
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setProgress(0);
    setUploading(true);

    try {
      // 1) pede URL pré-assinada
      const presignRes = await fetch("/api/v1/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          folder, // opcional
        }),
      });

      const data = await presignRes.json();
      if (!presignRes.ok) throw new Error(data.message || "Erro ao gerar URL");

      // 2) faz PUT direto pro S3 com XHR (pra ter progresso)
      await putWithProgress(data.url, file, file.type, (pct) => setProgress(pct));

      setUploading(false);
      setUploaded(true);
      onUploaded?.({ key: data.key, publicUrl: data.publicUrl });
    } catch (err: any) {
      setUploading(false);
      setError(err.message || "Falha no upload");
    }
  }

  if (compact) {
    return (
      <div className="grid gap-2">
        <label
          className={`flex h-12 items-center justify-center rounded-xl border border-dashed border-[var(--input)] px-4 text-sm font-semibold transition-colors focus-within:ring-[3px] focus-within:ring-[var(--liquid-accent)]/20 ${
            uploading ? "cursor-wait opacity-70" : "cursor-pointer hover:bg-[var(--muted)]"
          }`}
        >
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="sr-only" />
          {uploading ? `Enviando… ${progress}%` : uploaded ? "Trocar imagem" : "Escolher imagem"}
        </label>
        {error && (
          <p role="alert" className="text-[13px] font-medium text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow bg-white">
      <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-2">
        Selecione uma imagem para upload
      </span>
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
      />
      </label>

      {uploading && (
      <div>
        <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-blue-700">Enviando...</span>
        <span className="text-xs font-medium text-blue-700">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full bg-blue-500 transition-all"
          style={{ width: `${progress}%` }}
        />
        </div>
      </div>
      )}

      {error && (
      <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 rounded p-2">
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>{error}</span>
      </div>
      )}
    </div>
  );
}

function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    });
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`S3 respondeu ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Erro de rede no upload"));
    xhr.send(file);
  });
}
