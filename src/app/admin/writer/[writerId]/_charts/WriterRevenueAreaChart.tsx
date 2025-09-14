"use client";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function WriterRevenueAreaChart({
  data,
}: {
  data: { day: Date; revenue: number; sales: number }[];
}) {
  const series = data.map((d) => ({
    day: new Date(d.day).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    revenue: d.revenue,
    sales: d.sales,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="revenue" name="Receita (R$)" fillOpacity={0.2} />
          <Area type="monotone" dataKey="sales" name="Vendas" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
