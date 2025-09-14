// app/admin/writer-subscriptions/_charts/WriterSubsMRRAreaChart.tsx
"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function WriterSubsMRRAreaChart({
  data,
}: {
  data: { month: Date; mrr: number }[];
}) {
  const series = data.map((d) => ({
    month: new Date(d.month).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    mrr: d.mrr,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(v: number, n) => (n === "mrr" ? BRL.format(v) : v)} />
          <Legend />
          <Area type="monotone" dataKey="mrr" name="MRR (R$)" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
