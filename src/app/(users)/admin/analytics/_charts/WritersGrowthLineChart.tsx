// app/admin/analytics/_charts/WritersGrowthLineChart.tsx
"use client";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function WritersGrowthLineChart({
  data,
}: {
  data: { month: Date; count: number }[];
}) {
  const series = data.map((d) => ({
    month: new Date(d.month).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    count: d.count,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" name="Novos escritores" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
