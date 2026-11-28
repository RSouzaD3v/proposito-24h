/**
 * Cores do admin e do estúdio do escritor. Paleta categórica validada para daltonismo (ordem fixa: não reordenar).
 * Texto nunca usa a cor da série; ela só identifica a marca no gráfico.
 */
export const SERIES = ["#a0582a", "#2a6fa0", "#5f8f2a", "#8f4a8a"] as const;

export const CHART = {
  primary: SERIES[0],
  comparison: "#b8b0a2",
  grid: "#ece7de",
  tick: "#6e685e",
  good: "#3f7d4f",
  bad: "#b4412f",
  warn: "#c27c12",
  neutral: "#cfc8bb",
} as const;

/** Rampa sequencial (um tom, claro → escuro) para mapas de calor. */
export const HEAT = ["#f3ece4", "#e8d5c2", "#d9b393", "#c48a5f", "#a0582a", "#743c18"] as const;

export function heatColor(value: number, max: number) {
  if (value <= 0 || max <= 0) return "#f6f3ee";
  // Qualquer valor acima de zero já sai do primeiro tom, para não se confundir com "vazio".
  const step = 1 + Math.round((value / max) * (HEAT.length - 2));
  return HEAT[Math.min(HEAT.length - 1, step)];
}
