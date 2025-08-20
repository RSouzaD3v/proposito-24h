"use client";

import { useState } from "react";

type Props = {
  folder?: string; // ex: `writers/${writerId}` ou `uploads`
  onUploaded?: (fileInfo: { key: string; publicUrl: string }) => void;
};

export default function S3Uploader({ folder, onUploaded }: Props) {
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setProgress(0);
    setUploading(true);

    try {
      // 1) pede URL pré-assinada
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          folder, // opcional
        }),
      });

      const data = await presignRes.json();
      if (!presignRes.ok) throw new Error(data.error || "Erro ao gerar URL");

      // 2) faz PUT direto pro S3 com XHR (pra ter progresso)
      await putWithProgress(data.url, file, file.type, (pct) => setProgress(pct));

      setUploading(false);
      onUploaded?.({ key: data.key, publicUrl: data.publicUrl });
    } catch (err: any) {
      setUploading(false);
      setError(err.message || "Falha no upload");
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        className="block w-full text-sm"
      />

      {uploading && (
        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="h-2 rounded bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
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
