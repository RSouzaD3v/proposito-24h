"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Play, Pause } from "lucide-react";

/**
 * Componente de música de fundo para leitura do devocional.
 * - Fica fixo no topo-direito, acima de todos os elementos (z-index alto).
 * - Clique para tocar/pausar.
 * - Sempre que iniciar a reprodução, escolhe aleatoriamente um arquivo entre music1..music5.
 * - Quando a música terminar, toca outra aleatória automaticamente (shuffle contínuo).
 *
 * Requisitos:
 * - Coloque os arquivos em /public/song/music1.mp3 ... /public/song/music5.mp3
 */
export default function PlaySong({
  volume = 0.35, // volume padrão mais baixo para "música de fundo"
}: {
  volume?: number;
}) {
  const TRACKS = [1, 2, 3, 4, 5].map((n) => `/song/music${n}.mp3`);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const pickRandomIndex = useCallback(
    (exclude?: number | null) => {
      if (TRACKS.length === 1) return 0;
      let idx = Math.floor(Math.random() * TRACKS.length);
      // evita repetir a mesma faixa imediatamente
      while (exclude != null && TRACKS.length > 1 && idx === exclude) {
        idx = Math.floor(Math.random() * TRACKS.length);
      }
      return idx;
    },
    [TRACKS.length]
  );

  const stopAndCleanup = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.src = "";
    a.load();
    audioRef.current = null;
  }, []);

  const playRandom = useCallback(async () => {
    // Limpa o áudio anterior (e listeners)
    if (audioRef.current) {
      audioRef.current.onended = null;
      stopAndCleanup();
    }

    const nextIndex = pickRandomIndex(currentIndex);
    const nextSrc = TRACKS[nextIndex];

    const audio = new Audio(nextSrc);
    audio.preload = "auto";
    audio.volume = Math.max(0, Math.min(1, volume));
    // Quando terminar, toca outra aleatória automaticamente
    audio.onended = () => {
      // Apenas continua se ainda estivermos "em modo tocando"
      setTimeout(() => {
        if (audioRef.current === audio && isPlaying) {
          // chama playRandom novamente para novo shuffle
          playRandom().catch(() => {
            // silencia erros (ex.: bloqueio do navegador)
          });
        }
      }, 0);
    };

    audioRef.current = audio;
    setCurrentIndex(nextIndex);

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      // Ex.: navegador exigindo interação; mantemos pausado
      setIsPlaying(false);
      // opcional: console.warn("Falha ao reproduzir áudio:", err);
    }
  }, [TRACKS, currentIndex, pickRandomIndex, stopAndCleanup, volume, isPlaying]);

  const handleToggle = useCallback(() => {
    if (isPlaying) {
      // Pausa a faixa atual
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Sempre que voltar a tocar, escolhe uma faixa aleatória
      void playRandom();
    }
  }, [isPlaying, playRandom]);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.onended = null;
      }
      stopAndCleanup();
    };
  }, [stopAndCleanup]);

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={isPlaying}
        aria-label={
          isPlaying ? "Pausar música de fundo" : "Tocar música de fundo"
        }
        title={isPlaying ? "Pausar música de fundo" : "Tocar música de fundo"}
        className={[
          "rounded-full",
          "px-4 py-2",
          "shadow-lg",
          "backdrop-blur",
          "border border-white/20",
          isPlaying
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-neutral-900/80 text-white hover:bg-neutral-800",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500",
        ].join(" ")}
      >
        <span className="inline-flex items-center justify-center gap-2 font-medium">
          {/* Ícone simples sem dependências */}
          {isPlaying ? <Pause /> : <Play />}
        </span>
      </button>
    </div>
  );
}
