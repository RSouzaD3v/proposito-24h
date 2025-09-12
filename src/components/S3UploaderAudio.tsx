"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type UploadedInfo = {
  key: string;
  publicUrl: string;
  durationSec?: number;
  name?: string;
  size?: number;
  contentType?: string;
};

type Props = {
  folder?: string; // ex: `writers/${writerId}` ou `uploads/audios`
  onUploaded?: (fileInfo: UploadedInfo) => void;
  // permite áudio e também .mpeg (video/mpeg)
  accept?: string; // default abaixo
  maxSizeMB?: number; // default: 30
  label?: string; // default: "Selecione um áudio para upload"
};

const DEFAULT_ACCEPT =
  "audio/*,video/mpeg,.mp3,.m4a,.aac,.wav,.ogg,.webm,.mpeg,.mpg";

export default function S3AudioUploader({
  folder,
  onUploaded,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 30,
  label = "Selecione um áudio para upload",
}: Props) {
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{
    name: string;
    size: number;
    type: string;
    durationSec?: number;
  } | null>(null);

  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Arquivo acima de ${maxSizeMB} MB.`);
      return;
    }

    setError(null);
    setProgress(0);
    setUploading(true);
    setUploadedUrl(null);
    setFileMeta(null);

    const blobUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(blobUrl);

    try {
      // duração só para audio/* (para video/mpeg normalmente não precisamos)
      const fixedType = fixContentType(file);
      const durationSec =
        fixedType.startsWith("audio/")
          ? await getAudioDuration(file).catch(() => undefined)
          : undefined;

      // 1) presign — TEM que usar o MESMO ContentType que iremos enviar no PUT
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: fixedType,
          folder,
        }),
      });

      const data = await presignRes.json();
      if (!presignRes.ok) throw new Error(data.error || "Erro ao gerar URL");

      // 2) PUT no S3
      await putWithProgress(data.url, file, fixedType, (pct) =>
        setProgress(pct)
      );

      setUploading(false);
      setUploadedUrl(data.publicUrl);

      const meta = {
        name: file.name,
        size: file.size,
        type: fixedType,
        durationSec,
      };
      setFileMeta(meta);

      onUploaded?.({
        key: data.key,
        publicUrl: data.publicUrl,
        ...meta,
      });
    } catch (err: any) {
      setUploading(false);
      setError(err.message || "Falha no upload");
    }
  }

  const humanSize = useMemo(() => {
    if (!fileMeta?.size) return "";
    const mb = fileMeta.size / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }, [fileMeta]);

  const isVideo = !!fileMeta?.type && fileMeta.type.startsWith("video/");

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow bg-white">
      <label className="block">
        <span className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </span>
        <input
          type="file"
          accept={accept}
          onChange={handleFile}
          disabled={uploading}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
        />
      </label>

      {fileMeta && (
        <div className="text-xs text-gray-600">
          <div>
            <strong>Arquivo:</strong> {fileMeta.name}
          </div>
          <div>
            <strong>Tamanho:</strong> {humanSize}
          </div>
          <div>
            <strong>Tipo:</strong> {fileMeta.type}
          </div>
          {fileMeta.durationSec !== undefined && (
            <div>
              <strong>Duração:</strong> {formatDuration(fileMeta.durationSec)}
            </div>
          )}
        </div>
      )}

      {(localPreviewUrl || uploadedUrl) && (
        <div className="rounded-md border p-3">
          <p className="text-xs text-gray-700 mb-2">
            {uploadedUrl ? "Reproduzindo do S3" : "Prévia local"}
          </p>

          {/* se for video/mpeg (ou qualquer video/*), usa <video>, senão <audio> */}
          {isVideo ? (
            <video
              ref={mediaRef as any}
              controls
              preload="metadata"
              className="w-full"
              src={uploadedUrl ?? localPreviewUrl ?? undefined}
            />
          ) : (
            <audio
              ref={mediaRef as any}
              controls
              preload="none"
              className="w-full"
              src={uploadedUrl ?? localPreviewUrl ?? undefined}
            />
          )}

          {uploadedUrl && (
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-blue-700 hover:underline"
            >
              Abrir no navegador
            </a>
          )}
        </div>
      )}

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
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/** PUT com progresso para S3 */
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

/** Pega duração (só faz sentido para audio/*) */
function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const cleanup = () => URL.revokeObjectURL(url);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      cleanup();
      if (Number.isFinite(dur)) resolve(dur);
      else reject(new Error("Não foi possível obter a duração"));
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error("Falha ao carregar metadados de áudio"));
    };
    audio.src = url;
  });
}

/** Mapeia corretamente o Content-Type */
function fixContentType(file: File): string {
  // Se o browser já souber o tipo, use-o
  if (file.type) return file.type;

  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "mp3":
    case "mpga":
    case "mp2":
      return "audio/mpeg";
    case "m4a":
      return "audio/mp4"; // iOS tende a usar audio/mp4
    case "aac":
      return "audio/aac";
    case "wav":
      return "audio/wav";
    case "ogg":
    case "oga":
      return "audio/ogg";
    case "webm":
      return "audio/webm";
    case "flac":
      return "audio/flac";
    case "mpeg":
    case "mpg":
      // .mpeg/.mpg é contêiner de VÍDEO (video/mpeg)
      return "video/mpeg";
    default:
      return "application/octet-stream";
  }
}

function formatDuration(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
