// components/charts/RadialProgressCard.tsx
"use client";

import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarRadiusAxis,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

type Props = {
  title: string;
  description?: string;
  value: number;            // 0..100
  centerLabel?: string;
  footerNote?: string;
  colorVar?: string;        // ex.: "var(--chart-2)"
  thickness?: number;       // LARGURA do anel (px) — padrão 18
  outerRadius?: number;     // Raio externo (px) — padrão 110
};

export function RadialProgressCard({
  title,
  description,
  value,
  centerLabel = "Progresso",
  footerNote,
  colorVar = "var(--chart-2)",
  thickness = 18,          // <- ajuste aqui
  outerRadius = 110,       // <- ajuste aqui
}: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const outer = outerRadius;
  const inner = Math.max(outer - thickness, 0);

  // A cor do progresso vem daqui (ChartContainer -> --color-progress)
  const chartConfig = {
    progress: { label: "Progresso", color: colorVar },
  } satisfies ChartConfig;

  const data = [{ key: "progress", value: clamped, fill: "var(--color-progress)" }];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <RadialBarChart
            data={data}
            startAngle={90}
            endAngle={450}
            innerRadius={inner}
            outerRadius={outer}
          >
            {/* Garante que 100 = círculo completo e 20 = 20% */}
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

            {/* A barra e seu trilho (mesma espessura) */}
            <RadialBar dataKey="value" background cornerRadius={Math.min(12, thickness / 2)} />

            {/* Rótulo central */}
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const cx = viewBox.cx as number;
                    const cy = viewBox.cy as number;
                    return (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={cx} y={cy} className="fill-foreground text-4xl font-bold">
                          {clamped}%
                        </tspan>
                        <tspan x={cx} y={cy + 24} className="fill-muted-foreground">
                          {centerLabel}
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      {footerNote ? (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            {footerNote} <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}
