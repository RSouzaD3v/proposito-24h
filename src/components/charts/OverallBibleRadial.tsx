// components/charts/OverallBibleRadial.tsx
"use client";
import { RadialProgressCard } from "./RadialProgressCard";

export function OverallBibleRadial({ value }: { value: number }) {
  return (
    <RadialProgressCard
      title="Bíblia — Geral"
      description="Progresso geral no plano"
      value={value}
      centerLabel="Geral"
      colorVar="var(--chart-2)"
      thickness={45}
      outerRadius={120}
    />
  );
}
