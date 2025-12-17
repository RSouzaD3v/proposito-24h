"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FiPlay, FiPause, FiHeadphones } from "react-icons/fi";

type Props = {
  src?: string | null;
  className?: string;
  labelPlay?: string;   // padrão: "Ouvir"
  labelPause?: string;  // padrão: "Parar"
  style?: React.CSSProperties;
};

export default function AudioButton({
  src,
  className = "",
  labelPlay = "Ouvir",
  labelPause = "Parar",
  style
}: Props) {
  const [playing, setPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // (Re)cria o elemento de áudio quando a URL muda
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
        audio.pause();            // pausa e mantém o ponto atual
        setPlaying(false);
      } else {
        await audio.play();       // continua de onde parou
        setPlaying(true);
      }
    } catch (err) {
      console.error("Falha ao iniciar o áudio:", err);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Parar áudio" : "Tocar áudio"}
      className={className + " flex items-center justify-center gap-2 text-xl font-bold"}
      style={style}
    >
      {playing ? <FiPause /> : <FiPlay />}
      {playing ? labelPause : labelPlay}
      <FiHeadphones className="opacity-70" />
    </button>
  );
}
