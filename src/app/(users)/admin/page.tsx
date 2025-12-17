// app/admin/page.tsx
import { db } from "@/lib/db";
import { requireAdmin } from "./_lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function getDateRange() {
  const now = new Date();
  const end = new Date(now.setHours(23, 59, 59, 999));
  const start = new Date();
  start.setDate(end.getDate() - 29);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export default async function AdminHome() {
  await requireAdmin();
  const { start, end } = getDateRange();

  const [
    totalWriters,
    totalReaders,
    totalPublications,
    salesAgg,
    subsActive,
  ] = await Promise.all([
    db.writer.count(),
    db.user.count({ where: { role: "CLIENT" } }),
    db.publication.count(),
    db.purchase.aggregate({
      _sum: { amount: true, fees: true, netAmount: true },
      _count: true,
      where: { status: "SUCCESS", createdAt: { gte: start, lt: end } },
    }),
    db.readerSubscription.count({
      where: {
        OR: [{ lifetime: true }, { status: { in: ["ACTIVE", "TRIALING", "PAST_DUE", "PAUSED"] } }],
      },
    }),
  ]);

  const gross = Number(salesAgg._sum.amount ?? 0);
  const fees = Number(salesAgg._sum.fees ?? 0);
  const net = Number(salesAgg._sum.netAmount ?? 0) || Math.max(gross - fees, 0);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Visão geral
          </h1>
          <p className="text-sm text-muted-foreground">
            Panorama dos últimos 30 dias.
          </p>
        </div>
        <Badge variant="secondary">
          {start.toLocaleDateString()} — {end.toLocaleDateString()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Receita (30d)" value={BRL.format(net / 100)} />
        <Kpi title="Vendas (30d)" value={String(salesAgg._count)} />
        <Kpi title="Assinantes ativos" value={String(subsActive)} />
        <Kpi title="Leitores totais" value={String(totalReaders)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Métricas detalhadas, gráficos por período, top escritores e mais.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cadastros</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Row label="Escritores" value={String(totalWriters)} href="/admin/writers" />
            <Row label="Publicações" value={String(totalPublications)} href="/admin/analytics" />
            <Row label="Repasses" value="ver" href="/admin/payouts" />
          </CardContent>
        </Card>
      </div>
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

function Row({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted">
      <span>{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </Link>
  );
}
