"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";

export default function AudioButton({ src }: { src?: string | null }) {
  const [playing, setPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.preload = "none"; // só baixa quando o usuário der play
    audioRef.current = audio;

    const handleEnded = () => setPlaying(false);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [src]);

  if (!src) return null;

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        await audio.play();
        setPlaying(true);
      }
    } catch (err) {
      console.error("Falha ao iniciar o áudio:", err);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Pausar áudio" : "Ouvir áudio"}
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--liquid-ink)] transition-colors hover:bg-[var(--input)]"
    >
      {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
    </button>
  );
}
