// app/writer/analytics/_charts/SalesBarChart.tsx
"use client";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SalesBarChart({ data }: { data: { title: string; revenue: number; sales: number }[] }) {
  const formatted = data.map(d => ({ title: d.title, revenue: d.revenue, sales: d.sales }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" angle={-20} textAnchor="end" interval={0} height={60} />
          <YAxis />
          <Tooltip formatter={(value: number, name) => name === "revenue" ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value) : value} />
          <Bar dataKey="revenue" name="Receita (R$)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="sales" name="Vendas" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
