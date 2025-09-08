"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

type TTSReaderProps = {
  /** texto a ser lido (devocional, capítulo, etc) */
  text: string;
  /** opcional: voiceId clonada da ElevenLabs */
  voiceId?: string;
  /** opcional: modelo de TTS, ex: "eleven_multilingual_v2" */
  modelId?: string;
  /** pausa entre blocos em ms (quando o áudio muda) */
  gapMs?: number;
  /** tamanho máximo de bloco (a ElevenLabs suporta textos grandes, mas dividir ajuda) */
  maxChunkChars?: number;
  /** callback quando começa a tocar */
  onPlay?: () => void;
  /** callback quando termina tudo */
  onEnd?: () => void;
};

function splitIntoChunks(text: string, maxChars: number) {
  // quebra inteligente por frases/pontuação, mantendo <= maxChars
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[\.\!\?\:\;])\s+/);

  const chunks: string[] = [];
  let current = "";

  for (const s of sentences) {
    if ((current + " " + s).trim().length <= maxChars) {
      current = (current ? current + " " : "") + s;
    } else {
      if (current) chunks.push(current.trim());
      if (s.length > maxChars) {
        // se uma sentença passar do limite, faz fallback em pedaços “brutos”
        for (let i = 0; i < s.length; i += maxChars) {
          chunks.push(s.slice(i, i + maxChars));
        }
        current = "";
      } else {
        current = s;
      }
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

export default function TTSReader({
  text,
  voiceId,
  modelId,
  gapMs = 250,
  maxChunkChars = 1800,
  onPlay,
  onEnd
}: TTSReaderProps) {
  const chunks = useMemo(() => splitIntoChunks(text, maxChunkChars), [text, maxChunkChars]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 sobre os chunks
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cleanupObjectURL = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const fetchChunkAudio = useCallback(async (textChunk: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const res = await fetch("/api/tts/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: abortRef.current.signal,
      body: JSON.stringify({ text: textChunk, voiceId, modelId })
    });

    if (!res.ok) {
      const details = await res.text().catch(() => "");
      throw new Error(`TTS falhou: ${details}`);
    }

    const blob = await res.blob();
    cleanupObjectURL();
    const objUrl = URL.createObjectURL(blob);
    objectUrlRef.current = objUrl;
    return objUrl;
  }, [voiceId, modelId]);

  const playCurrent = useCallback(async () => {
    if (!audioRef.current) return;
    if (index >= chunks.length) return;

    setLoading(true);
    try {
      const src = await fetchChunkAudio(chunks[index]);
      audioRef.current.src = src;
      await audioRef.current.play();
      setIsPlaying(true);
      onPlay?.();
    } finally {
      setLoading(false);
    }
  }, [chunks, index, fetchChunkAudio, onPlay]);

  const handlePlayPause = useCallback(async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    // se ainda não carregou nada ou terminou, recomeça do índice atual
    await playCurrent();
  }, [isPlaying, playCurrent]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    audioRef.current?.pause();
    setIsPlaying(false);
    setIndex(0);
    setProgress(0);
    cleanupObjectURL();
    if (audioRef.current) audioRef.current.src = "";
  }, []);

  // avança quando termina um chunk
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onEnded = async () => {
      const next = index + 1;
      setProgress(next / chunks.length);
      if (next < chunks.length) {
        setIndex(next);
        if (gapMs > 0) await new Promise(r => setTimeout(r, gapMs));
        // auto-play próximo
        playCurrent();
      } else {
        setIsPlaying(false);
        onEnd?.();
      }
    };

    const onError = () => {
      setIsPlaying(false);
    };

    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [index, chunks.length, gapMs, playCurrent, onEnd]);

  // limpa URLs ao desmontar
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      cleanupObjectURL();
    };
  }, []);

  return (
    <div className="bg-blue-700 w-fit my-5 p-2 rounded-xl">
      <audio ref={audioRef} preload="none" />

      <div className="flex items-center gap-2">
        <button
          onClick={handlePlayPause}
          disabled={loading || chunks.length === 0}
          
          aria-label={isPlaying ? "Pausar leitura" : "Tocar leitura"}
        >
          {loading ? "Carregando…" : isPlaying ? <div className="flex items-center gap-1 text-white">
            <Pause /> Pausar
            </div> : <div className="flex items-center gap-1 text-white">
              <Play /> Escutar
              </div>}
        </button>

        {/* <button
          onClick={handleStop}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
        >
          Parar
        </button> */}
{/* 
        <span className="text-sm opacity-80">
          Parte {Math.min(index + 1, chunks.length)} / {chunks.length}
        </span> */}
      </div>

      {/* <div className="w-full h-2 bg-white/10 rounded">
        <div
          className="h-2 bg-white/60 rounded"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <details className="text-xs opacity-70">
        <summary>Debug</summary>
        <div>Chars totais: {text.length}</div>
        <div>Chunks: {chunks.length}</div>
        <div>Índice atual: {index}</div>
        <div>Tocando: {String(isPlaying)}</div>
      </details> */}
    </div>
  );
}
