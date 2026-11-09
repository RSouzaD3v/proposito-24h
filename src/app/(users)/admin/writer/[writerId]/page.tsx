import { apiGetOrNull } from "@/lib/api/server";
// app/admin/writer/[writerId]/page.tsx
import { notFound } from "next/navigation";
import { requireAdmin } from "../../_lib/auth";
import Link from "next/link";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import WriterRevenueAreaChart from "./_charts/WriterRevenueAreaChart";
import WriterTopProductsBarChart from "./_charts/WriterTopProductsBarChart";
import WriterSubsDonut from "./_charts/WriterSubsDonut";
import { Suspense } from "react";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const ACTIVE_STATUSES = ["ACTIVE", "TRIALING", "PAST_DUE", "PAUSED"] as const;

export default async function AdminWriterDetail({
  params,
  searchParams,
}: {
  params: Promise<{ writerId: string }>;
  searchParams?: Promise<{ range?: string }>;
}) {
  await requireAdmin();
  const { writerId } = await params;
  const sp = (await searchParams) ?? {};
  const r = sp.range ?? "30d";
  const data = await apiGetOrNull<any>(`/admin/writers/${writerId}?range=${encodeURIComponent(r)}`);
  if (!data) return notFound();
  const { writer, readers, subs, publications, net } = data;
  const revenueByDay: any[] = data.revenueByDay;
  const topProducts: any[] = data.topProducts;
  const subStatusDist: any[] = data.subStatusDist;
  const latestPurchases: any[] = data.latestPurchases;
  const latestReaderSubs: any[] = data.latestReaderSubs;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{writer.name}</h1>
          <p className="text-sm text-muted-foreground">Análise do escritor • Período {r.toUpperCase()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* {writer.domains.map((d, i) => (
            <Badge key={i} variant={d.isPrimary ? "default" : "secondary"}>
              {d.host} {d.isPrimary ? "(primário)" : ""}
            </Badge>
          ))} */}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Receita (período)" value={BRL.format(net / 100)} hint="líquido" />
        <Kpi title="Vendas (período)" value={String(data.sales)} />
        <Kpi title="Assinantes" value={String(subs)} hint="ativos + vitalícios" />
        <Kpi title="Leitores totais" value={String(readers)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita diária</CardTitle>
            <CardDescription>Último período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded" />}>
              <WriterRevenueAreaChart
                data={revenueByDay.map(d => ({
                  day: new Date(d.day),
                  revenue: Number(d.revenue_cents) / 100,
                  sales: d.sales,
                }))}
              />
            </Suspense>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Valores líquidos quando disponíveis (senão: bruto – taxas).
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das assinaturas (leitores)</CardTitle>
            <CardDescription>Distribuição atual</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded" />}>
              <WriterSubsDonut data={subStatusDist} />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top publicações por receita</CardTitle>
            <CardDescription>Período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded" />}>
              <WriterTopProductsBarChart
                data={topProducts.map(p => ({
                  title: p.title,
                  revenue: Number(p.revenue_cents) / 100,
                  sales: p.sales,
                }))}
              />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publicações</CardTitle>
            <CardDescription>Publicadas: {publications}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/writer/${writer.slug ?? writer.id}`} className="underline">
              Ver storefront
            </Link>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compras recentes</CardTitle>
            <CardDescription>Últimas 15</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Leitor</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestPurchases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {p.user?.name ?? p.user?.email ?? "-"}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">
                      {p.publication?.title ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {BRL.format((p.netAmount ?? p.amount - (p.fees ?? 0)) / 100)}
                    </TableCell>
                  </TableRow>
                ))}
                {latestPurchases.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sem compras</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assinaturas de leitores</CardTitle>
            <CardDescription>Últimas 15</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestReaderSubs.map((s) => {
                  const active = s.lifetime || ACTIVE_STATUSES.includes(s.status as any);
                  return (
                    <TableRow key={s.id}>
                      <TableCell>{s.currentPeriodStart ? new Date(s.currentPeriodStart).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={active ? "default" : "secondary"}>{s.status}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate">{s.priceId}</TableCell>
                    </TableRow>
                  );
                })}
                {latestReaderSubs.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sem assinaturas</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {hint ? <CardDescription>{hint}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
