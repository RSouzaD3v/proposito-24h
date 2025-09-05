"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Play, Pause } from "lucide-react";

/**
 * PlaySong — música de fundo com shuffle contínuo (loop):
 * - Botão fixo topo-direito, acima de tudo.
 * - Play/Pause.
 * - Ao iniciar, escolhe aleatoriamente music1..music5.
 * - Ao terminar a faixa, toca outra aleatória automaticamente (loop infinito).
 * Coloque os arquivos em /public/song/music1.mp3 ... /public/song/music5.mp3
 */
export default function PlaySong({
  volume = 0.35, // volume padrão mais baixo para "música de fundo"
}: {
  volume?: number;
}) {
  const TRACKS = [1, 2, 3, 4, 5].map((n) => `/song/music${n}.mp3`);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);               // estado "ao vivo" p/ callbacks
  const lastIndexRef = useRef<number | null>(null); // última faixa tocada

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const pickRandomIndex = useCallback(
    (exclude?: number | null) => {
      if (TRACKS.length === 1) return 0;
      let idx = Math.floor(Math.random() * TRACKS.length);
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
    a.onended = null;
    a.pause();
    a.src = "";
    a.load();
    audioRef.current = null;
  }, []);

  const playNextRandom = useCallback(async () => {
    // Limpa o áudio anterior (e listeners)
    if (audioRef.current) {
      audioRef.current.onended = null;
      stopAndCleanup();
    }

    // Escolhe próxima (evita repetir imediatamente)
    const nextIndex = pickRandomIndex(lastIndexRef.current);
    const nextSrc = TRACKS[nextIndex];

    const audio = new Audio(nextSrc);
    audio.preload = "auto";
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.loop = false; // o "loop" é o nosso shuffle no onended

    // Ao terminar, toca outra aleatória se ainda estiver tocando
    audio.onended = () => {
      if (isPlayingRef.current && audioRef.current === audio) {
        setTimeout(() => {
          void playNextRandom();
        }, 0);
      }
    };

    audioRef.current = audio;
    lastIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);

    try {
      await audio.play();
      isPlayingRef.current = true;
      setIsPlaying(true);
    } catch {
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
  }, [TRACKS, pickRandomIndex, stopAndCleanup, volume]);

  const handleToggle = useCallback(() => {
    if (isPlayingRef.current) {
      // Pausar
      isPlayingRef.current = false;
      setIsPlaying(false);
      audioRef.current?.pause();
    } else {
      // Sempre que voltar a tocar, escolhe uma faixa aleatória
      void playNextRandom();
    }
  }, [playNextRandom]);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
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
          "rounded-full md:px-4 px-2 py-1  md:py-2 shadow-lg backdrop-blur border border-white/20",
          isPlaying
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-neutral-900/80 text-white hover:bg-neutral-800",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500",
        ].join(" ")}
      >
        <span className="inline-flex md:w-5 w-10 items-center justify-center gap-2 font-medium">
          {isPlaying ? <Pause /> : <Play />}
          {/* Mostra a faixa atual opcionalmente */}
          {/* {currentIndex != null && (
            <span className="text-xs opacity-80">#{currentIndex + 1}</span>
          )} */}
        </span>
      </button>
    </div>
  );
}
