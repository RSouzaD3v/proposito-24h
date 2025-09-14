// app/admin/writers/page.tsx
import { db } from "@/lib/db";
import { requireAdmin } from "../_lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function AdminWritersPage() {
  await requireAdmin();

  // Receita e vendas por escritor nos últimos 30 dias
  const now = new Date();
  const end = new Date(now.setHours(23, 59, 59, 999));
  const start = new Date();
  start.setDate(end.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  const rows: {
    writer_id: string;
    writer_name: string;
    revenue_cents: bigint;
    sales: number;
  }[] = await db.$queryRaw`
    SELECT w."id" as writer_id, w."name" as writer_name,
           COALESCE(SUM(COALESCE(p."netAmount", p."amount" - COALESCE(p."fees",0)))::bigint, 0) AS revenue_cents,
           COUNT(p.*)::int AS sales
      FROM "Writer" w
      LEFT JOIN "Purchase" p ON p."writerId" = w."id"
           AND p."status" = 'SUCCESS'
           AND p."createdAt" >= ${start} AND p."createdAt" < ${end}
     GROUP BY w."id", w."name"
     ORDER BY revenue_cents DESC, sales DESC
     LIMIT 50`;

  // leitores e assinantes por escritor (geral)
  const readerCounts = await db.user.groupBy({
    by: ["writerId"],
    _count: { _all: true },
    where: { role: "CLIENT", writerId: { not: null } },
  });

  const subCounts = await db.readerSubscription.groupBy({
    by: ["writerId"],
    _count: { _all: true },
    where: {
      OR: [{ lifetime: true }, { status: { in: ["ACTIVE", "TRIALING", "PAST_DUE", "PAUSED"] } }],
    },
  });

  const readerMap = new Map(readerCounts.map((r) => [r.writerId!, r._count._all]));
  const subMap = new Map(subCounts.map((s) => [s.writerId, s._count._all]));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Escritores</h1>
        <p className="text-sm text-muted-foreground">Últimos 30 dias + totais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 50 (receita)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escritor</TableHead>
                <TableHead className="text-right">Receita (30d)</TableHead>
                <TableHead className="text-right">Vendas (30d)</TableHead>
                <TableHead className="text-right">Assinantes</TableHead>
                <TableHead className="text-right">Leitores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.writer_id}>
                  <TableCell>
                    <Link href={`/writer/${r.writer_id}`} className="underline">
                      {r.writer_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{BRL.format(Number(r.revenue_cents) / 100)}</TableCell>
                  <TableCell className="text-right">{r.sales}</TableCell>
                  <TableCell className="text-right">{subMap.get(r.writer_id) ?? 0}</TableCell>
                  <TableCell className="text-right">{readerMap.get(r.writer_id) ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
