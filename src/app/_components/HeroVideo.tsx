"use client";

import { useEffect, useState } from "react";

type NetworkInformation = { saveData?: boolean };

/** Baixa o vídeo só em telas grandes, sem economia de dados e sem preferência por menos movimento. */
export function HeroVideo() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const allowed =
      window.matchMedia("(min-width: 768px)").matches &&
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
