"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Monitor, Moon, RotateCw, Smartphone, Sun, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";

const DEVICES = [
  { key: "phone", label: "Celular", width: 390, height: 780, icon: Smartphone },
  { key: "tablet", label: "Tablet", width: 768, height: 1024, icon: Tablet },
  { key: "desktop", label: "Computador", width: 1280, height: 800, icon: Monitor },
] as const;

type DeviceKey = (typeof DEVICES)[number]["key"];

const toolButton = (active: boolean) =>
  cn(
    "flex size-9 items-center justify-center rounded-full transition-colors",
    active ? "bg-[var(--liquid-accent)] text-white" : "text-[var(--liquid-muted)] hover:bg-white/70",
  );

/**
 * Abre a área do leitor em um iframe do tamanho real do aparelho e reduz só a imagem:
 * barras fixas e breakpoints se comportam exatamente como no aparelho do leitor.
 */
export function DevicePreview({
  src,
  frameRef,
  controls,
  initialDevice = "phone",
  className,
}: {
  src: string;
  frameRef?: RefObject<HTMLIFrameElement | null>;
  controls?: ReactNode;
  initialDevice?: DeviceKey;
  className?: string;
}) {
  const [deviceKey, setDeviceKey] = useState<DeviceKey>(initialDevice);
  const [dark, setDark] = useState(false);
  const [reloads, setReloads] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const device = DEVICES.find(({ key }) => key === deviceKey)!;
  const scale = available.width
    ? Math.min(available.width / device.width, available.height / device.height, 1)
    : 0;
  const frameSrc = `${src}${src.includes("?") ? "&" : "?"}mode=${dark ? "dark" : "light"}`;

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="glass-surface flex items-center gap-0.5 rounded-full p-1">
          {DEVICES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              title={label}
              aria-label={`Ver como ${label}`}
              aria-pressed={key === deviceKey}
              onClick={() => setDeviceKey(key)}
              className={toolButton(key === deviceKey)}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
        <div className="glass-surface flex items-center gap-0.5 rounded-full p-1">
          <button
            type="button"
            title={dark ? "Ver no tema claro" : "Ver no tema escuro"}
            aria-label={dark ? "Ver no tema claro" : "Ver no tema escuro"}
            onClick={() => setDark((value) => !value)}
            className={toolButton(false)}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            type="button"
            title="Recarregar prévia"
            aria-label="Recarregar prévia"
            onClick={() => setReloads((value) => value + 1)}
            className={toolButton(false)}
          >
            <RotateCw className="size-4" />
          </button>
        </div>
        {controls}
      </div>

      <div ref={stage} className="relative min-h-0 flex-1 overflow-hidden">
        {scale > 0 && (
          <div
            className="absolute left-1/2 top-0 overflow-hidden rounded-[1.75rem] border-[6px] border-neutral-900 bg-white shadow-2xl"
            style={{
              width: device.width,
              height: device.height,
              transform: `translateX(-50%) scale(${scale})`,
              transformOrigin: "top center",
            }}
          >
            <iframe
              key={`${frameSrc}:${reloads}`}
              ref={frameRef}
              src={frameSrc}
              title={`Prévia em ${device.label}`}
              className="size-full border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
