import { apiGet } from "@/lib/api/server";
// app/admin/writers/page.tsx
import { requireAdmin } from "../_lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function AdminWritersPage() {
  await requireAdmin();

  const rows = await apiGet<any[]>("/admin/writers");

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
                    <Link href={`/admin/writer/${r.writer_id}`} className="underline">
                      {r.writer_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{BRL.format(Number(r.revenue_cents) / 100)}</TableCell>
                  <TableCell className="text-right">{r.sales}</TableCell>
                  <TableCell className="text-right">{r.subscribers}</TableCell>
                  <TableCell className="text-right">{r.readers}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
