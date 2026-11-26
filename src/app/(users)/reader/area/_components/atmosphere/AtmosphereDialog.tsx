"use client";

import { useEffect } from "react";
import { AudioLines, Bird, Check, CloudRain, Cross, Droplets, Guitar, Info, Leaf, Loader2, Music, Music4, Pause, Piano, Play, Volume1, VolumeX, Waves, Wind, X, type LucideIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  ATMOSPHERE_SOUNDS,
  AtmosphereCategory,
  AtmosphereSound,
  CATEGORIES,
  describeAtmosphere,
  hydrateAtmosphere,
  selectSound,
  setAtmosphereVolume,
  toggleAtmosphere,
  useAtmosphere,
} from "@/lib/atmosphere/engine";
import { cn } from "@/lib/utils";

const SOUND_ICON: Record<string, LucideIcon> = {
  piano: Piano,
  violao: Guitar,
  harpa: Music4,
  cordas: Music,
  adoracao: Cross,
  chuva: CloudRain,
  riacho: Droplets,
  passaros: Bird,
  ondas: Waves,
  vento: Wind,
};

const SECTION_ICON: Record<AtmosphereCategory, LucideIcon> = { instrumental: Music, nature: Leaf };

const BARS = [0.35, 0.6, 0.9, 0.5, 1, 0.7, 0.4, 0.8, 0.45];

/** Barrinhas que "respiram" enquanto a atmosfera toca. */
function Waveform({ active, mirror }: { active: boolean; mirror?: boolean }) {
  const heights = mirror ? [...BARS].reverse() : BARS;
  return (
    <div aria-hidden className="flex h-10 items-center gap-1">
      {heights.map((height, index) => (
        <span
          key={index}
          className={cn("atmosphere-bar h-10 w-[3px] origin-center rounded-full bg-[#f4efe4]/70", active && "atmosphere-bar-active")}
          style={{ transform: `scaleY(${height})`, animationDelay: `${index * 90}ms`, animationDuration: `${520 + (index % 3) * 140}ms` }}
        />
      ))}
    </div>
  );
}

function SoundTile({ sound, selected, onSelect }: { sound: AtmosphereSound; selected: boolean; onSelect: () => void }) {
  const available = sound.src != null;
  const Icon = SOUND_ICON[sound.id] ?? Music;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={!available}
      onClick={onSelect}
      aria-label={available ? sound.label : `${sound.label}, em breve`}
      className={cn(
        "relative flex h-[120px] w-[104px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-2xl border-[1.5px] border-white/15 p-2 text-white transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[#9fe29a]",
        available ? "cursor-pointer hover:scale-[1.03] active:scale-[0.98]" : "cursor-not-allowed opacity-45",
        selected && "border-[2.5px] border-[#9fe29a]",
      )}
      style={{ backgroundImage: `linear-gradient(to bottom, transparent 35%, rgb(0 0 0 / 0.55)), linear-gradient(to bottom, ${sound.colors[0]}, ${sound.colors[1]})` }}
    >
      <Icon className="absolute top-5 left-1/2 size-8 -translate-x-1/2 text-white/90" strokeWidth={1.6} />
      <span className="text-center text-[12.5px] leading-4 font-semibold">{sound.label}</span>
      {!available && <span className="absolute top-1.5 left-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9.5px] font-bold tracking-wide text-[#f4efe4]">Em breve</span>}
      {selected && (
        <span className="absolute top-1.5 right-1.5 flex size-[22px] items-center justify-center rounded-full bg-[#9fe29a] text-[#0d2414]">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

/** Janela da Atmosfera Devocional (mesmo desenho do app). Paleta fixa verde, igual no tema claro e escuro. */
export function AtmosphereDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const atmosphere = useAtmosphere();
  const description = describeAtmosphere(atmosphere);
  const hasSelection = description.length > 0;

  useEffect(() => {
    hydrateAtmosphere();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92dvh] gap-0 overflow-y-auto overscroll-contain rounded-3xl border-white/10 bg-[#0f1d16] p-0 text-[#f4efe4] sm:max-w-md"
      >
        <div className="reader-scene-olive relative flex min-h-[210px] flex-col items-center justify-end gap-1.5 px-5 pb-5 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-45% to-[#0f1d16]" />
          <DialogClose
            aria-label="Fechar"
            className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-[#f4efe4] transition-colors hover:bg-black/45"
          >
            <X className="size-5" />
          </DialogClose>
          <AudioLines className="relative size-10" />
          <DialogTitle className="relative font-[family-name:var(--font-reader-serif)] text-3xl font-semibold tracking-tight text-[#f4efe4]">Atmosfera Devocional</DialogTitle>
          <DialogDescription className="relative text-sm text-[#f4efe4]/75">Prepare o ambiente para o seu momento com Deus.</DialogDescription>
        </div>

        {CATEGORIES.map(({ key, title }, index) => {
          const SectionIcon = SECTION_ICON[key];
          const volume = atmosphere.volumes[key];
          return (
            <section key={key} className={cn("mx-5 flex flex-col gap-3 py-4", index > 0 && "border-t border-white/10")}>
              <h3 className="flex items-center gap-3 font-[family-name:var(--font-reader-serif)] text-xl font-semibold">
                <SectionIcon className="size-5 text-[#9fe29a]" />
                {title}
              </h3>
              <div className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 py-1 [scrollbar-width:none]">
                {ATMOSPHERE_SOUNDS[key].map((sound) => (
                  <SoundTile key={sound.id} sound={sound} selected={atmosphere[key] === sound.id} onSelect={() => selectSound(key, sound.id)} />
                ))}
              </div>
              <div className={cn("flex items-center gap-3", !atmosphere[key] && "opacity-50")}>
                {volume === 0 ? <VolumeX className="size-5 shrink-0" /> : <Volume1 className="size-5 shrink-0" />}
                <Slider
                  aria-label={`Volume de ${title.toLowerCase()}`}
                  value={[Math.round(volume * 100)]}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setAtmosphereVolume(key, value / 100)}
                  className="py-3 [&_[data-slot=slider-range]]:bg-[#9fe29a] [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-[#f4efe4] [&_[data-slot=slider-thumb]]:shadow-md [&_[data-slot=slider-track]]:bg-white/15"
                />
                <span className="w-11 shrink-0 text-right text-[15px] font-semibold tabular-nums">{Math.round(volume * 100)}%</span>
              </div>
            </section>
          );
        })}

        <div className="flex flex-col gap-4 px-5 pb-5">
          <div className="reader-scene-olive relative flex flex-col items-center gap-1 overflow-hidden rounded-3xl border border-white/10 px-4 py-5 text-center">
            <div className="absolute inset-0 bg-[#08140e]/45" />
            <AudioLines className="relative size-6" />
            <p className="relative mt-1 text-[15px]">Sua atmosfera devocional</p>
            <p aria-live="polite" className="relative font-[family-name:var(--font-reader-serif)] text-2xl leading-8 font-semibold">
              {hasSelection ? description : "Escolha um som acima"}
            </p>
            <div className="relative mt-3 flex items-center gap-4">
              <Waveform active={atmosphere.playing} />
              <button
                type="button"
                disabled={!hasSelection}
                onClick={toggleAtmosphere}
                aria-label={atmosphere.playing ? "Pausar atmosfera" : "Tocar atmosfera"}
                className="flex size-20 items-center justify-center rounded-full bg-gradient-to-b from-[#9fe29a] to-[#5fb56a] text-[#0d2414] shadow-[0_0_24px_rgb(159_226_154/0.4)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {atmosphere.loading && atmosphere.playing ? (
                  <Loader2 className="size-8 animate-spin" />
                ) : atmosphere.playing ? (
                  <Pause className="size-8 fill-current" />
                ) : (
                  <Play className="ml-1 size-8 fill-current" />
                )}
              </button>
              <Waveform active={atmosphere.playing} mirror />
            </div>
          </div>

          <p className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-[#f4efe4]/75">
            <Info className="size-4 shrink-0" />
            A reprodução continua enquanto você navega pelo aplicativo.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
