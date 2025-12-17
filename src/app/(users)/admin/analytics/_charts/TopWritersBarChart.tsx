// app/admin/analytics/_charts/TopWritersBarChart.tsx
"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function TopWritersBarChart({
  data,
}: {
  data: { name: string; revenue: number; sales: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} height={60} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" name="Receita (R$)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="sales" name="Vendas" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
