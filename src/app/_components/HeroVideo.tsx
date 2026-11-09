"use client";

import { useEffect, useState } from "react";

type NetworkInformation = { saveData?: boolean };

/** Respeita quem pediu economia de dados ou menos movimento; os demais veem o vídeo em qualquer tela. */
export function HeroVideo() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const allowed =
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !connection?.saveData;
    setEnabled(allowed);
  }, []);

  if (!enabled) return null;
  return (
    <video autoPlay muted loop playsInline aria-hidden className="absolute inset-0 -z-2 size-full object-cover">
      <source src="/video/fundo-sol.mp4" type="video/mp4" />
    </video>
  );
}
