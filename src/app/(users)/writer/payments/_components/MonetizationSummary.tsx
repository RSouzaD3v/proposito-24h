import Link from "next/link";
import { BookOpen, Layers, LockKeyhole, PenLine } from "lucide-react";
import { formatMoney, planName, planPeriod } from "@/components/subscriptions/billing";
import { cn } from "@/lib/utils";
import type { AccessTier, Monetization } from "./types";

const FEATURES: { key: keyof Monetization["featureAccess"]; label: string }[] = [
  { key: "devotional", label: "Devocional" },
  { key: "verse", label: "Versículo" },
  { key: "quote", label: "Citação" },
  { key: "prayer", label: "Oração" },
  { key: "biblePlan", label: "Plano bíblico" },
];

const TIER: Record<AccessTier, { label: string; tone: string }> = {
  FREE: { label: "Grátis", tone: "bg-emerald-600/12 text-emerald-800" },
  SUBSCRIPTION: { label: "Só assinantes", tone: "bg-amber-500/15 text-amber-900" },
  PAID_PATRON: { label: "Assinatura ou compra", tone: "bg-sky-600/12 text-sky-900" },
};

const BOOK_STATUS: Record<string, string> = { DRAFT: "Rascunho", PUBLISHED: "Publicado", ARCHIVED: "Arquivado" };

const surface = "rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)]";
const pill = "inline-block rounded-full px-2 py-0.5 text-[11px] font-bold";
const editLink =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--liquid-accent)] underline-offset-4 hover:underline";

function Card({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={cn(surface, "p-5")}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold text-[var(--liquid-ink)]">
          {icon}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function bookAccess(book: Monetization["library"][number]) {
  if (book.accessMode === "FREE") return "Grátis para todos";
  if (book.accessMode === "SUBSCRIPTION") return "Só assinantes";
  return `Venda avulsa · ${formatMoney(book.price ?? 0)} (ou assinatura)`;
}

/** Resumo de como o leitor paga; cada bloco leva à tela em que aquilo é editado. */
export function MonetizationSummary({ data, plansHref }: { data: Monetization; plansHref: string | null }) {
  const plansLink = plansHref ? (
    <Link href={plansHref} className={editLink}>
      <PenLine className="size-3.5" aria-hidden /> Editar
    </Link>
  ) : null;

  return (
    <div className="grid gap-4">
      <Card title="Planos de assinatura" icon={<Layers className="size-4 text-[var(--reader-gold)]" aria-hidden />} action={plansLink}>
        {data.plans.length === 0 ? (
          <p className="text-sm text-[var(--liquid-muted)]">
            Nenhum plano criado. Sem plano, seus leitores só conseguem comprar livros avulsos.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)] text-sm">
            {data.plans.map((plan) => {
              const period = planPeriod(plan);
              const hidden = !plan.isActive || !plan.isReaderVisible;
              return (
                <li key={plan.id} className={cn("flex flex-wrap items-center justify-between gap-2 py-2.5", hidden && "opacity-60")}>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[var(--liquid-ink)]">{planName(plan)}</span>
                    {plan.trialDays > 0 && plan.interval !== "LIFETIME" && (
                      <span className={cn(pill, "bg-[var(--reader-gold)]/15 text-[var(--reader-gold)]")}>
                        {plan.trialDays} dias grátis
                      </span>
                    )}
                    {!plan.isActive ? (
                      <span className={cn(pill, "bg-[var(--muted)] text-[var(--liquid-muted)]")}>Inativo</span>
                    ) : !plan.isReaderVisible ? (
                      <span className={cn(pill, "bg-[var(--muted)] text-[var(--liquid-muted)]")}>Oculto para leitores</span>
                    ) : null}
                  </span>
                  <span className="font-semibold text-[var(--liquid-ink)]">
                    {formatMoney(plan.amountCents, plan.currency)}
                    <span className="font-normal text-[var(--liquid-muted)]">{period ? ` por ${period}` : " (pagamento único)"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title="Conteúdo diário" icon={<LockKeyhole className="size-4 text-[var(--reader-gold)]" aria-hidden />} action={plansLink}>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {FEATURES.map(({ key, label }) => {
            const tier = TIER[data.featureAccess[key]] ?? TIER.FREE;
            return (
              <li key={key} className="flex items-center justify-between gap-2 rounded-xl bg-[var(--muted)]/60 px-3 py-2">
                <span className="text-[var(--liquid-ink)]">{label}</span>
                <span className={cn(pill, tier.tone)}>{tier.label}</span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card
        title="Livros"
        icon={<BookOpen className="size-4 text-[var(--reader-gold)]" aria-hidden />}
        action={
          <Link href="/writer/publications" className={editLink}>
            Ver publicações
          </Link>
        }
      >
        {data.library.length === 0 ? (
          <p className="text-sm text-[var(--liquid-muted)]">Nenhum livro ainda.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] text-sm">
            {data.library.map((book) => (
              <li key={book.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-[var(--liquid-ink)]">{book.title}</span>
                  <span className="block text-[13px] text-[var(--liquid-muted)]">
                    {BOOK_STATUS[book.status] ?? book.status} · {bookAccess(book)}
                    {book.accessMode !== "FREE" &&
                      (book.freePreviewChapters > 0
                        ? ` · ${book.freePreviewChapters} ${book.freePreviewChapters === 1 ? "capítulo grátis" : "capítulos grátis"}`
                        : " · sem degustação")}
                  </span>
                </span>
                <Link href={`/writer/publications/edit/${book.id}`} className={editLink}>
                  <PenLine className="size-3.5" aria-hidden /> Editar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
