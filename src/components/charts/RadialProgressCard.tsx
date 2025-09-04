// components/charts/RadialProgressCard.tsx
"use client";

import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
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
  value: number; // 0..100
  centerLabel?: string; // ex.: "Velho Testamento"
  footerNote?: string;
  colorVar?: string; // ex.: "var(--chart-2)"
};

export function RadialProgressCard({
  title,
  description,
  value,
  centerLabel = "Progresso",
  footerNote,
  colorVar = "var(--chart-2)",
}: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const chartData = [
    { key: "progress", value: clamped, fill: "var(--color-progress)" },
  ];

  const chartConfig: ChartConfig = {
    progress: {
      label: "Progresso",
      color: colorVar,
    },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={450}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={(props) => {
                  const viewBox = (props as any)?.viewBox as
                    | { cx?: number; cy?: number }
                    | undefined;

                  const cx = viewBox?.cx;
                  const cy = viewBox?.cy;

                  if (typeof cx === "number" && typeof cy === "number") {
                    return (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={cx}
                          y={cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {clamped}%
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 24}
                          className="fill-muted-foreground"
                        >
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
