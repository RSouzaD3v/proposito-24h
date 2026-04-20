// app/admin/writer-subscriptions/page.tsx
import { db } from "@/lib/db";
import { requireAdmin } from "../_lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import WriterSubsMRRAreaChart from "./_charts/WriterSubsMRRAreaChart";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function rangeDates(range?: string) {
  const now = new Date();
  const end = new Date(now.setHours(23, 59, 59, 999));
  const start = new Date();
  const map: Record<string, number> = { "7d": 6, "30d": 29, "90d": 89, "365d": 364 };
  start.setDate(end.getDate() - (map[range ?? "30d"] ?? 29));
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export default async function AdminWriterSubscriptions({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: "all" | "active" | "ended"; range?: string }>;
}) {
  await requireAdmin();

  const sp = (await searchParams) ?? {};
  const q = sp.q?.trim() || "";
  const status = sp.status ?? "all";
  const range = sp.range ?? "30d";
  const { start, end } = rangeDates(range);

  const now = new Date();

  // KPIs
  const [activeCount, mrrNowAgg, newInPeriod, canceledInPeriod] = await Promise.all([
    db.writerSubscription.count({
      where: { OR: [{ endedAt: null }, { endedAt: { gt: now } }] },
    }),
   db.writerSubscription.aggregate({
     _sum: { amount: true },
     where: { OR: [{ endedAt: null }, { endedAt: { gt: now } }] },
   }),
   db.writerSubscription.count({ where: { startedAt: { gte: start, lt: end } } }),
   db.writerSubscription.count({ where: { endedAt: { gte: start, lt: end } } }),
 ]);


 const mrrNow = Number(mrrNowAgg._sum.amount ?? 0) / 100;

  // Série MRR por mês (últimos 12 meses) – ativa no mês = startedAt < mês+1 e (endedAt null ou >= mês)
  const mrrSeries = await db.$queryRaw<Array<{ month: Date; mrr: number }>>`
   WITH months AS (
     SELECT generate_series(
       date_trunc('month', now()) - interval '11 months',
       date_trunc('month', now()),
       interval '1 month'
     ) AS month
   )
   SELECT m.month::date AS month,
           COALESCE(SUM(ws."amount")::numeric, 0) AS mrr
     FROM months m
     LEFT JOIN "WriterSubscription" ws
       ON ws."startedAt" < (m.month + interval '1 month')
      AND (ws."endedAt" IS NULL OR ws."endedAt" >= m.month)
    GROUP BY m.month
    ORDER BY m.month;
 `;

  // Filtro de listagem
  const where: any = {};
  if (status === "active") where.OR = [{ endedAt: null }, { endedAt: { gt: now } }];
  if (status === "ended") where.endedAt = { lte: now };
  if (q) {
    where.OR = [
      ...(where.OR ?? []),
      { asaasSubscriptionId: { contains: q, mode: "insensitive" } },
      { stripeId: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { writer: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const subscriptions = await db.writerSubscription.findMany({
    where,
    include: { writer: { select: { id: true, name: true, slug: true } } },
    orderBy: { startedAt: "desc" },
    take: 100,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Assinaturas de Escritores</h1>
          <p className="text-sm text-muted-foreground">Plataforma — WriterSubscription</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">Período: {range.toUpperCase()}</Badge>
          <span>Início: {start.toLocaleDateString()}</span>
          <span>Fim: {end.toLocaleDateString()}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Assinaturas ativas" value={String(activeCount)} />
        <Kpi title="MRR atual" value={BRL.format(mrrNow)} />
        <Kpi title="Novas no período" value={String(newInPeriod)} />
        <Kpi title="Canceladas no período" value={String(canceledInPeriod)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>MRR (últimos 12 meses)</CardTitle>
            <CardDescription>Assinaturas ativas por mês × valor do plano</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded" />}>
              <WriterSubsMRRAreaChart
                data={mrrSeries.map((r) => ({
                  month: new Date(r.month),
                  mrr: Number(r.mrr) / 100,
                }))}
              />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Status e busca</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {/* Filtro de status */}
            <div className="flex gap-2">
              <FilterLink label="Todos" href="/admin/writer-subscriptions?status=all" active={status === "all"} />
              <FilterLink label="Ativos" href="/admin/writer-subscriptions?status=active" active={status === "active"} />
              <FilterLink label="Encerrados" href="/admin/writer-subscriptions?status=ended" active={status === "ended"} />
            </div>

            {/* Filtro de período */}
            <div className="flex gap-2">
              {["7d", "30d", "90d", "365d"].map((r) => (
                <FilterLink
                  key={r}
                  label={r === "365d" ? "1 ano" : r}
                  href={`/admin/writer-subscriptions?status=${status}&range=${r}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  active={range === r}
                />
              ))}
            </div>

            {/* Busca por escritor / Asaas / descrição */}
            <form className="flex gap-2" action="/admin/writer-subscriptions" method="get">
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="range" value={range} />
              <Input name="q" placeholder="Buscar por escritor, asaasSubscriptionId, descrição..." defaultValue={q} />
              <Button type="submit" variant="secondary">Buscar</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Assinaturas (até 100)</CardTitle>
          <CardDescription>Mais recentes primeiro</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escritor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Asaas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((s) => {
                const active = !s.endedAt || s.endedAt > now;
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      {s.writer?.name ? (
                        <Link href={`/writer/${s.writer.id}`} className="underline">{s.writer.name}</Link>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{s.description ?? "-"}</TableCell>
                    <TableCell className="text-right">{BRL.format(Number(s.amount) / 100)}</TableCell>
                    <TableCell>{new Date(s.startedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{s.endedAt ? new Date(s.endedAt).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={active ? "default" : "secondary"}>{active ? "ATIVA" : "ENCERRADA"}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">{s.asaasSubscriptionId ?? s.stripeId ?? "-"}</TableCell>
                  </TableRow>
                );
              })}
              {subscriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhuma assinatura encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm ${
        active ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
      }`}
    >
      {label}
    </Link>
  );
}
