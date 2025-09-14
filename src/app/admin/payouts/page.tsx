// app/admin/payouts/page.tsx
import { db } from "@/lib/db";
import { requireAdmin } from "../_lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function AdminPayoutsPage() {
  await requireAdmin();

  const payouts = await db.writerPayout.findMany({
    orderBy: { createdAt: "desc" },
    include: { writer: { select: { name: true } } },
    take: 100,
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Repasses</h1>
        <p className="text-sm text-muted-foreground">Últimos 100 registros</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
          <CardDescription>Período, valores e status</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escritor</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Bruto</TableHead>
                <TableHead className="text-right">Taxas</TableHead>
                <TableHead className="text-right">Líquido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ref.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.writer.name}</TableCell>
                  <TableCell>
                    {new Date(p.periodStart).toLocaleDateString()} –{" "}
                    {new Date(p.periodEnd).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">{BRL.format(p.grossAmount / 100)}</TableCell>
                  <TableCell className="text-right">{BRL.format((p.fees ?? 0) / 100)}</TableCell>
                  <TableCell className="text-right">{BRL.format(p.netAmount / 100)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === "PAID" ? "default" : p.status === "PENDING" ? "secondary" : "destructive"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="truncate max-w-[180px]">{p.reference ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
