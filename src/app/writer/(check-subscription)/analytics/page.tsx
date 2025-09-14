// app/writer/analytics/page.tsx
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

// shadcn/ui
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// icons
import { FiBarChart2, FiShoppingBag, FiUsers, FiUserPlus, FiBookOpen, FiChevronRight } from "react-icons/fi";

// client-side charts
import RevenueAreaChart from "./_charts/RevenueAreaChart";
import SalesBarChart from "./_charts/SalesBarChart";
import SubscribersLineChart from "./_charts/SubscribersLineChart";
import StatusDonutChart from "./_charts/StatusDonutChart";


const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function getDateRange(range?: string) {
  const now = new Date();
  const end = new Date(now.setHours(23, 59, 59, 999));
  const start = new Date();
  switch (range) {
    case "7d":
      start.setDate(end.getDate() - 6); // inclusivo
      break;
    case "90d":
      start.setDate(end.getDate() - 89);
      break;
    case "365d":
      start.setDate(end.getDate() - 364);
      break;
    case "30d":
    default:
      start.setDate(end.getDate() - 29);
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

const ACTIVE_STATUSES = ["ACTIVE", "TRIALING", "PAST_DUE", "PAUSED"] as const;

export default async function WriterAnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const range = sp.range ?? "30d";
  const { start, end } = getDateRange(range);

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.writerId) return notFound();

  const writer = await db.writer.findUnique({ where: { id: user.writerId } });
  if (!writer) return notFound();

  // ------------- KPIs & Aggregations -------------
  // Receita e vendas por dia no período
  const revenueByDay: { day: Date; revenue_cents: bigint; sales: number }[] = await db.$queryRaw`SELECT DATE_TRUNC('day', "createdAt") AS day, SUM(COALESCE("netAmount", "amount" - COALESCE("fees",0)))::bigint AS revenue_cents, COUNT(*)::int AS sales FROM "Purchase" WHERE "writerId" = ${writer.id} AND "status" = 'SUCCESS' AND "createdAt" >= ${start} AND "createdAt" < ${end} GROUP BY 1 ORDER BY 1`;

  // Top publicações (por receita) no período
  const topProducts: { id: string; title: string; revenue_cents: bigint; sales: number }[] = await db.$queryRaw`SELECT p."id" as id, p."title" as title, SUM(COALESCE(pr."netAmount", pr."amount" - COALESCE(pr."fees",0)))::bigint AS revenue_cents, COUNT(*)::int AS sales FROM "Purchase" pr JOIN "Publication" p ON pr."publicationId" = p."id" WHERE pr."writerId" = ${writer.id} AND pr."status" = 'SUCCESS' AND pr."createdAt" >= ${start} AND pr."createdAt" < ${end} GROUP BY p."id", p."title" ORDER BY revenue_cents DESC LIMIT 8`;

  // Novos assinantes por dia no período
  const newSubsByDay: { day: Date; new_subs: number }[] = await db.$queryRaw`SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::int AS new_subs FROM "ReaderSubscription" WHERE "writerId" = ${writer.id} AND ("lifetime" = true OR "status" IN ('ACTIVE','TRIALING','PAST_DUE','PAUSED')) AND "createdAt" >= ${start} AND "createdAt" < ${end} GROUP BY 1 ORDER BY 1`;

  // Distribuição de status de assinatura (geral)
  const statusDist: { status: string; count: number }[] = await db.$queryRaw`SELECT "status"::text AS status, COUNT(*)::int AS count FROM "ReaderSubscription" WHERE "writerId" = ${writer.id} GROUP BY 1`;

  // KPIs absolutos
  const [
    totalReaders,
    booksCount,
    subsCount,
    salesAgg,
  ] = await Promise.all([
    db.user.count({ where: { writerId: writer.id, role: "CLIENT" } }),
    db.publication.count({ where: { writerId: writer.id, type: "EBOOK", status: "PUBLISHED" } }),
    db.readerSubscription.count({
      where: {
        writerId: writer.id,
        OR: [
          { lifetime: true },
          { status: { in: [...ACTIVE_STATUSES] as any } },
        ],
      },
    }),
    db.purchase.aggregate({
      _sum: {
        amount: true,
        fees: true,
        netAmount: true,
      },
      _count: true,
      where: {
        writerId: writer.id,
        status: "SUCCESS",
        createdAt: { gte: start, lt: end },
      },
    }),
  ]);

  const totalSalesInPeriod = salesAgg._count;
  const grossCents = Number(salesAgg._sum.amount ?? 0);
  const feesCents = Number(salesAgg._sum.fees ?? 0);
  const netCents = Number(salesAgg._sum.netAmount ?? 0) || Math.max(grossCents - feesCents, 0);

  return (
    <section className="min-h-screen w-full px-4 md:px-8 py-8">
        <div className="my-2">
            <Link className="text-sm text-white bg-blue-600 p-1 rounded-sm" href={"/writer/dashboard"}>Voltar para o Painel</Link>
        </div>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Painel do Escritor</h1>
          <p className="text-sm text-muted-foreground">Acompanhe ganhos, vendas e sua base de leitores.</p>
        </div>
        <div className="flex items-center gap-2">
          <RangeTabs initialRange={range} />
          <Link href="/writer/publications">
            <Button variant="secondary" className="gap-2"><FiBookOpen /> Publicações</Button>
          </Link>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Receita (período)" icon={<FiBarChart2 />} value={BRL.format(netCents / 100)} hint="líquido" />
        <KpiCard title="Vendas (período)" icon={<FiShoppingBag />} value={String(totalSalesInPeriod)} hint="pagas" />
        <KpiCard title="Assinantes" icon={<FiUserPlus />} value={String(subsCount)} hint="ativos + vitalícios" />
        <KpiCard title="Leitores totais" icon={<FiUsers />} value={String(totalReaders)} hint="base do escritor" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receita & Vendas por dia */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita diária</CardTitle>
            <CardDescription>Último período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}> 
              <RevenueAreaChart data={revenueByDay.map(r => ({ day: new Date(r.day), revenue: Number(r.revenue_cents)/100, sales: r.sales }))} />
            </Suspense>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">Valores líquidos (quando disponível) ou bruto – taxas subtraídas quando possível.</CardFooter>
        </Card>

        {/* Distribuição de status de assinatura */}
        <Card>
          <CardHeader>
            <CardTitle>Status das assinaturas</CardTitle>
            <CardDescription>Panorama atual</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}> 
              <StatusDonutChart data={statusDist} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Top produtos por receita */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Produtos mais vendidos</CardTitle>
            <CardDescription>Receita e quantidade no período</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}> 
              <SalesBarChart data={topProducts.map(p => ({ title: p.title, revenue: Number(p.revenue_cents)/100, sales: p.sales }))} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Assinantes ao longo do tempo */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de assinantes</CardTitle>
            <CardDescription>Novos por dia (acumulado)</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}> 
              <SubscribersLineChart data={newSubsByDay.map(d => ({ day: new Date(d.day), newSubs: d.new_subs }))} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <Badge variant="secondary">Período: {range.toUpperCase()}</Badge>
        <span>Início: {start.toLocaleDateString()}</span>
        <span>Fim: {end.toLocaleDateString()}</span>
        {/* <span className="inline-flex items-center gap-1"><FiChevronRight /> <Link href="/writer/payouts" className="underline">Ver repasses</Link></span> */}
      </div>
    </section>
  );
}


function KpiCard({ title, value, hint, icon }: { title: string; value: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function RangeTabs({ initialRange }: { initialRange: string }) {
  const ranges = [
    { key: "7d", label: "7d" },
    { key: "30d", label: "30d" },
    { key: "90d", label: "90d" },
    { key: "365d", label: "1 ano" },
  ];
  return (
    <Tabs defaultValue={initialRange} className="w-fit">
      <TabsList>
        {ranges.map(r => (
          <TabsTrigger key={r.key} value={r.key} asChild>
            {/* Using Link to trigger server re-render via searchParams */}
            <Link href={`?range=${r.key}`}>{r.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
      {ranges.map(r => (
        <TabsContent key={r.key} value={r.key} />
      ))}
    </Tabs>
  );
}