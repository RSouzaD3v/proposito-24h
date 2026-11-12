// app/admin/payouts/page.tsx
import { Banknote, CheckCircle2, Clock, Receipt } from "lucide-react";
import { apiGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { requireAdmin } from "../_lib/auth";
import { cents, INT } from "../_lib/format";
import { StatTile } from "../_components/StatTile";
import { PayoutsTable, type Payout } from "./_components/PayoutsTable";

export default async function AdminPayoutsPage() {
  await requireAdmin();
  const payouts = await apiGet<Payout[]>("/admin/payouts");

  const total = (status: string) =>
    payouts.filter((payout) => payout.status === status).reduce((sum, payout) => sum + payout.netAmount, 0);
  const pending = payouts.filter((payout) => payout.status === "PENDING");
  const fees = payouts
    .filter((payout) => payout.status !== "CANCELED")
    .reduce((sum, payout) => sum + (payout.fees ?? 0), 0);

  return (
    <section className="space-y-6">
      <header className="animate-glass-in">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Repasses</h1>
        <p className="text-sm text-[var(--liquid-muted)]">Últimos 100 repasses aos escritores. Toque em um registro para ver os detalhes.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile
          label="A pagar"
          value={cents(total("PENDING"))}
          icon={Clock}
          tone={pending.length ? "orange" : "slate"}
          hint={`${INT.format(pending.length)} ${pending.length === 1 ? "repasse pendente" : "repasses pendentes"}`}
        />
        <StatTile label="Já pago" value={cents(total("PAID"))} icon={CheckCircle2} tone="green" />
        <StatTile label="Taxas" value={cents(fees)} icon={Receipt} tone="violet" hint="pendentes e pagos" />
        <StatTile label="Registros" value={INT.format(payouts.length)} icon={Banknote} tone="slate" />
      </div>

      <GlassCard strong padding="none">
        <PayoutsTable payouts={payouts} />
      </GlassCard>
    </section>
  );
}
