// app/admin/analytics/page.tsx
import { db } from "@/lib/db";
import { requireAdmin } from "../_lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RevenueAreaChart from "./_charts/RevenueAreaChart";
import TopWritersBarChart from "./_charts/TopWritersBarChart";
import StatusDonutChart from "./_charts/StatusDonutChart";
import WritersGrowthLineChart from "./_charts/WritersGrowthLineChart";
import { Suspense } from "react";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function getDateRange(range?: string) {
  const now = new Date();
  const end = new Date(now.setHours(23, 59, 59, 999));
  const start = new Date();
  const r = range ?? "30d";
  const map: Record<string, number> = { "7d": 6, "30d": 29, "90d": 89, "365d": 364 };
  start.setDate(end.getDate() - (map[r] ?? 29));
  start.setHours(0, 0, 0, 0);
  return { start, end, r };
}

export default async function AdminAnalytics({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  await requireAdmin();
  const sp = (await searchParams) ?? {};
  const { start, end, r } = getDateRange(sp.range);

  const revenueByDay: { day: Date; revenue_cents: bigint; sales: number }[] =
    await db.$queryRaw`
      SELECT date_trunc('day', "createdAt") AS day,
             SUM(COALESCE("netAmount", "amount" - COALESCE("fees",0)))::bigint AS revenue_cents,
             COUNT(*)::int AS sales
        FROM "Purchase"
       WHERE "status" = 'SUCCESS'
         AND "createdAt" >= ${start} AND "createdAt" < ${end}
       GROUP BY 1 ORDER BY 1`;

  const topWriters: { writer_id: string; writer_name: string; revenue_cents: bigint; sales: number }[] =
    await db.$queryRaw`
      SELECT w."id" as writer_id, w."name" as writer_name,
             SUM(COALESCE(p."netAmount", p."amount" - COALESCE(p."fees",0)))::bigint AS revenue_cents,
             COUNT(*)::int AS sales
        FROM "Purchase" p
        JOIN "Writer" w ON p."writerId" = w."id"
       WHERE p."status" = 'SUCCESS'
         AND p."createdAt" >= ${start} AND p."createdAt" < ${end}
       GROUP BY w."id", w."name"
       ORDER BY revenue_cents DESC
       LIMIT 10`;

  const statusDist: { status: string; count: number }[] =
    await db.$queryRaw`
      SELECT "status"::text AS status, COUNT(*)::int AS count
        FROM "ReaderSubscription"
       GROUP BY 1`;

  const writersByMonth: { month: Date; count: number }[] =
    await db.$queryRaw`
      SELECT date_trunc('month', "createdAt") AS month, COUNT(*)::int AS count
        FROM "Writer"
       WHERE "createdAt" >= ${new Date(end.getFullYear() - 1, end.getMonth(), 1)}
       GROUP BY 1 ORDER BY 1`;

  const periodNet = revenueByDay.reduce((sum, r) => sum + Number(r.revenue_cents), 0);

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
