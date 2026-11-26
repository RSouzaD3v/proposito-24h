"use client";

import { useState } from "react";
import { AudioLines, Play } from "lucide-react";
import { useAtmosphere } from "@/lib/atmosphere/engine";
import { AtmosphereDialog } from "./atmosphere/AtmosphereDialog";

/**
 * Botão de play do painel do leitor: abre a Atmosfera Devocional.
 * O som vive fora deste componente (lib/atmosphere/engine), então continua tocando
 * mesmo quando o painel é desmontado ao trocar de página.
 */
export default function PlaySong() {
  const [open, setOpen] = useState(false);
  const { playing } = useAtmosphere();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={playing ? "Atmosfera Devocional tocando. Abrir" : "Abrir Atmosfera Devocional"}
        title="Atmosfera Devocional"
        className={[
          "flex size-9 items-center justify-center rounded-full transition-colors",
          playing ? "bg-[var(--liquid-accent)] text-[var(--liquid-on-accent)]" : "text-[var(--liquid-ink)] hover:bg-[var(--muted)]",
        ].join(" ")}
      >
        <span className="inline-flex items-center justify-center [&_svg]:size-4">{playing ? <AudioLines /> : <Play />}</span>
      </button>
      <AtmosphereDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
