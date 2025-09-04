// components/charts/OldTestamentRadial.tsx
"use client";
import { RadialProgressCard } from "./RadialProgressCard";

export function OldTestamentRadial({ value }: { value: number }) {
  return (
    <RadialProgressCard
      title="Velho Testamento"
      description="Progresso total no VT"
      value={value}
      centerLabel="VT"
      colorVar="var(--chart-3)"
    />
  );
}
