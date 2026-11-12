"use client";

import { BookOpen, Check, Heart, Home, Search, TriangleAlert, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const COLOR_KEYS = [
  "primaryColor",
  "secondaryColor",
  "backgroundColor",
  "textColor",
  "bgButtonColor",
  "buttonTextColor",
  "independenteColor1",
  "independenteColor2",
] as const;

export type ColorKey = (typeof COLOR_KEYS)[number];
export type Colors = Record<ColorKey, string>;

/** Mesmos padrões que a API usa quando o campo está vazio (reader/home.rules.ts). */
export const DEFAULT_COLORS: Colors = {
  primaryColor: "#202020",
  secondaryColor: "#404040",
  backgroundColor: "#ffffff",
  textColor: "#000000",
  bgButtonColor: "#22c55e",
  buttonTextColor: "#ffffff",
  independenteColor1: "#f97316",
  independenteColor2: "#f97316",
};

export const COLOR_GROUPS: { title: string; fields: { key: ColorKey; label: string }[] }[] = [
  {
    title: "Marca",
    fields: [
      { key: "primaryColor", label: "Primária" },
      { key: "secondaryColor", label: "Secundária" },
    ],
  },
  {
    title: "Tela",
    fields: [
      { key: "backgroundColor", label: "Fundo" },
      { key: "textColor", label: "Texto" },
    ],
  },
  {
    title: "Botões",
    fields: [
      { key: "bgButtonColor", label: "Fundo do botão" },
      { key: "buttonTextColor", label: "Texto do botão" },
    ],
  },
  {
    title: "Destaques",
    fields: [
      { key: "independenteColor1", label: "Destaque 1" },
      { key: "independenteColor2", label: "Destaque 2" },
    ],
  },
];

export const PRESETS: { name: string; colors: Colors }[] = [
  { name: "Padrão", colors: DEFAULT_COLORS },
  {
    name: "Oceano",
    colors: {
      primaryColor: "#0f3b66",
      secondaryColor: "#2b6de5",
      backgroundColor: "#f5f9ff",
      textColor: "#1a2b4a",
      bgButtonColor: "#2b6de5",
      buttonTextColor: "#ffffff",
      independenteColor1: "#0ea5e9",
      independenteColor2: "#f59e0b",
    },
  },
  {
    name: "Pergaminho",
    colors: {
      primaryColor: "#5b4128",
      secondaryColor: "#8a6a35",
      backgroundColor: "#fbf7ef",
      textColor: "#241c15",
      bgButtonColor: "#8a6a35",
      buttonTextColor: "#ffffff",
      independenteColor1: "#b45309",
      independenteColor2: "#15803d",
    },
  },
  {
    name: "Noite",
    colors: {
      primaryColor: "#e2e8f0",
      secondaryColor: "#94a3b8",
      backgroundColor: "#0f172a",
      textColor: "#f1f5f9",
      bgButtonColor: "#818cf8",
      buttonTextColor: "#0f172a",
      independenteColor1: "#f472b6",
      independenteColor2: "#34d399",
    },
  },
  {
    name: "Oliva",
    colors: {
      primaryColor: "#365314",
      secondaryColor: "#4d7c0f",
      backgroundColor: "#fafaf5",
      textColor: "#1c1917",
      bgButtonColor: "#4d7c0f",
      buttonTextColor: "#ffffff",
      independenteColor1: "#ca8a04",
      independenteColor2: "#9a3412",
    },
  },
];

export const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

/** Valor salvo (às vezes vazio ou fora do formato) → cor usável no input nativo. */
export function normalizeColor(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value);
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toLowerCase();
  return isHex(value) ? value.toLowerCase() : fallback;
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map((index) => {
    const value = parseInt(hex.slice(index, index + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** Razão de contraste WCAG entre duas cores (1 a 21). */
export function contrast(a: string, b: string) {
  if (!isHex(a) || !isHex(b)) return 1;
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

export function ContrastBadge({ ratio, label }: { ratio: number; label: string }) {
  const level = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA grande" : "Baixo";
  const ok = ratio >= 4.5;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs",
        ok ? "bg-emerald-50 text-emerald-800" : ratio >= 3 ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-800",
      )}
    >
      <span className="flex items-center gap-1.5">
        {ok ? <Check className="size-3.5" aria-hidden /> : <TriangleAlert className="size-3.5" aria-hidden />}
        {label}
      </span>
      <span className="font-semibold tabular-nums">
        {ratio.toFixed(1)}:1 · {level}
      </span>
    </div>
  );
}

export function ColorInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const valid = isHex(value);
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className={cn("flex items-center gap-2 rounded-lg border bg-white p-1 pr-2", !valid && "border-red-300")}>
        <input
          type="color"
          aria-label={`${label}: seletor`}
          value={valid ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="size-8 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-black/10 [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <Input
          id={id}
          value={value}
          maxLength={7}
          spellCheck={false}
          aria-invalid={!valid}
          onChange={(event) => {
            const next = event.target.value.trim();
            onChange(next.startsWith("#") ? next : `#${next}`);
          }}
          className="h-8 border-0 px-1 font-mono text-sm uppercase shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

/** Miniatura do app do leitor com as cores aplicadas. */
export function ThemePreview({ colors, name, compact = false }: { colors: Colors; name: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "mx-auto w-full overflow-hidden rounded-[1.75rem] border-[6px] border-slate-900 shadow-xl",
        compact ? "max-w-[220px]" : "max-w-[260px]",
      )}
      style={{ background: colors.backgroundColor, color: colors.textColor }}
      aria-label={`Prévia do tema de ${name}`}
      role="img"
    >
      <div className="px-4 pb-3 pt-4" style={{ background: colors.primaryColor }}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/30" />
        <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: colors.backgroundColor, opacity: 0.8 }}>
          {name || "Escritor"}
        </p>
        <p className="text-sm font-bold leading-tight" style={{ color: colors.backgroundColor }}>
          Vamos passar um tempo com Deus?
        </p>
      </div>

      <div className="space-y-2.5 p-3">
        <div className="flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[10px]" style={{ borderColor: `${colors.secondaryColor}55`, opacity: 0.8 }}>
          <Search className="size-3" aria-hidden /> Buscar
        </div>

        <div className="rounded-xl p-2.5" style={{ background: `${colors.secondaryColor}14`, border: `1px solid ${colors.secondaryColor}33` }}>
          <div className="mb-1 flex items-center justify-between">
            <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white" style={{ background: colors.independenteColor1 }}>
              Devocional do dia
            </span>
            <Heart className="size-3" style={{ color: colors.independenteColor2 }} aria-hidden />
          </div>
          <p className="text-[11px] font-semibold leading-snug">O Senhor é o meu pastor</p>
          <p className="text-[9px] leading-snug" style={{ opacity: 0.7 }}>
            Salmos 23 · leitura de 4 minutos
          </p>
        </div>

        {!compact && (
          <div className="flex gap-2">
            {[colors.independenteColor1, colors.independenteColor2].map((color, index) => (
              <div key={index} className="flex-1 rounded-lg p-2" style={{ background: `${color}1f` }}>
                <p className="text-[9px] font-semibold" style={{ color }}>
                  {index === 0 ? "Sequência" : "Conquistas"}
                </p>
                <p className="text-xs font-bold">{index === 0 ? "7 dias" : "12"}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl py-2 text-center text-[11px] font-semibold" style={{ background: colors.bgButtonColor, color: colors.buttonTextColor }}>
          Começar leitura
        </div>
      </div>

      <div className="flex justify-around border-t px-2 py-2" style={{ borderColor: `${colors.secondaryColor}33` }}>
        {[Home, BookOpen, Heart, User].map((Icon, index) => (
          <Icon
            key={index}
            className="size-3.5"
            style={{ color: index === 0 ? colors.primaryColor : colors.secondaryColor, opacity: index === 0 ? 1 : 0.6 }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
