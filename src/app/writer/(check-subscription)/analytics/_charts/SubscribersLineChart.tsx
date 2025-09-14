// app/writer/analytics/_charts/SubscribersLineChart.tsx
"use client";
import * as React from "react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SubscribersLineChart({ data }: { data: { day: Date; newSubs: number }[] }) {
  // Acumular para curva cumulativa
  const series = React.useMemo(() => {
    let acc = 0;
    return data.map(d => {
      acc += d.newSubs;
      return {
        day: new Date(d.day).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        cumulative: acc,
        newSubs: d.newSubs,
      };
    });
  }, [data]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="cumulative" name="Acumulado" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="newSubs" name="Novos" strokeWidth={1} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}