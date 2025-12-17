// app/admin/analytics/_charts/StatusDonutChart.tsx
"use client";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

const LABELS: Record<string, string> = {
  INCOMPLETE: "Incomplete",
  INCOMPLETE_EXPIRED: "Incomplete Exp.",
  TRIALING: "Trial",
  ACTIVE: "Ativa",
  PAST_DUE: "Atrasada",
  CANCELED: "Cancelada",
  UNPAID: "Em débito",
  PAUSED: "Pausada",
};

export default function StatusDonutChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  const series = data
    .filter((d) => d.count > 0)
    .map((d) => ({ name: LABELS[d.status] ?? d.status, value: d.count }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={series} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2} />
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
