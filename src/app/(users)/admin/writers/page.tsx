// app/admin/writers/page.tsx
import { CircleDollarSign, ShoppingBag, UserCheck, Users2 } from "lucide-react";
import { apiGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { requireAdmin } from "../_lib/auth";
import { cents, INT } from "../_lib/format";
import { StatTile } from "../_components/StatTile";
import { WritersTable, type WriterRow } from "./_components/WritersTable";

export default async function AdminWritersPage() {
  await requireAdmin();
  const rows = (await apiGet<WriterRow[]>("/admin/writers")).map((row) => ({
    ...row,
    revenue_cents: Number(row.revenue_cents),
  }));

  const revenue = rows.reduce((sum, row) => sum + row.revenue_cents, 0);
  const sales = rows.reduce((sum, row) => sum + row.sales, 0);
  const subscribers = rows.reduce((sum, row) => sum + row.subscribers, 0);
  const selling = rows.filter((row) => row.sales > 0).length;

  return (
    <section className="space-y-6">
      <header className="animate-glass-in">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Escritores</h1>
        <p className="text-sm text-[var(--liquid-muted)]">Os 50 escritores com mais receita nos últimos 30 dias.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Escritores listados" value={INT.format(rows.length)} icon={Users2} tone="slate" hint={`${INT.format(selling)} com vendas no período`} />
        <StatTile label="Receita líquida (30d)" value={cents(revenue)} icon={CircleDollarSign} tone="blue" />
        <StatTile label="Vendas (30d)" value={INT.format(sales)} icon={ShoppingBag} tone="green" />
        <StatTile label="Assinantes ativos" value={INT.format(subscribers)} icon={UserCheck} tone="violet" />
      </div>

      <GlassCard strong padding="none">
        <WritersTable rows={rows} />
      </GlassCard>
    </section>
  );
}
