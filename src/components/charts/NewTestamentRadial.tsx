// components/charts/NewTestamentRadial.tsx
"use client";
import { RadialProgressCard } from "./RadialProgressCard";

export function NewTestamentRadial({ value }: { value: number }) {
  return (
    <RadialProgressCard
      title="Novo Testamento"
      description="Progresso total no NT"
      value={value}
      centerLabel="NT"
      colorVar="var(--chart-1)"
    />
  );
}
