import { apiGet } from "@/lib/api/server";
// app/admin/page.tsx
import { requireAdmin } from "./_lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function AdminHome() {
  await requireAdmin();
  const overview = await apiGet<any>("/admin/overview");
  const { totalWriters, totalReaders, totalPublications, subsActive, net } = overview;
  const start = new Date(overview.start);
  const end = new Date(overview.end);

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
        <Kpi title="Vendas (30d)" value={String(overview.sales)} />
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
