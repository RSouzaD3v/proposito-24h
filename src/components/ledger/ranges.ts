export const RANGES = [
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "365d", label: "1 ano" },
] as const;

export type RangeKey = (typeof RANGES)[number]["key"];

export function rangeOf(requested: string | undefined) {
  return RANGES.find(({ key }) => key === requested) ?? RANGES[1];
}
