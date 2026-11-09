import { apiGet } from "@/lib/api/server";
// app/admin/analytics/page.tsx
import { requireAdmin } from "../_lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RevenueAreaChart from "./_charts/RevenueAreaChart";
import TopWritersBarChart from "./_charts/TopWritersBarChart";
import StatusDonutChart from "./_charts/StatusDonutChart";
import WritersGrowthLineChart from "./_charts/WritersGrowthLineChart";
import { Suspense } from "react";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function AdminAnalytics({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  await requireAdmin();
  const sp = (await searchParams) ?? {};
  const r = sp.range ?? "30d";
  const data = await apiGet<any>(`/admin/analytics?range=${encodeURIComponent(r)}`);
  const revenueByDay: any[] = data.revenueByDay;
  const topWriters: any[] = data.topWriters;
  const statusDist: any[] = data.statusDist;
  const writersByMonth: any[] = data.writersByMonth;
  const periodNet = revenueByDay.reduce((sum: number, row) => sum + Number(row.revenue_cents), 0);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Período: {r.toUpperCase()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita diária</CardTitle>
            <CardDescription>Valores líquidos quando disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded" />}>
              <RevenueAreaChart
                data={revenueByDay.map((d) => ({
                  day: new Date(d.day),
                  revenue: Number(d.revenue_cents) / 100,
                  sales: d.sales,
                }))}
                totalLabel={BRL.format(periodNet / 100)}
              />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das assinaturas</CardTitle>
            <CardDescription>Panorama geral</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded" />}>
              <StatusDonutChart data={statusDist} />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top escritores por receita</CardTitle>
            <CardDescription>Último período</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded" />}>
              <TopWritersBarChart
                data={topWriters.map((w) => ({
                  name: w.writer_name,
                  revenue: Number(w.revenue_cents) / 100,
                  sales: w.sales,
                }))}
              />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crescimento de escritores</CardTitle>
            <CardDescription>Novos por mês (últimos 12 meses)</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded" />}>
              <WritersGrowthLineChart
                data={writersByMonth.map((m) => ({
                  month: new Date(m.month),
                  count: m.count,
                }))}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
