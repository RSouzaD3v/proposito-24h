import { cn } from "@/lib/utils";
import { cents } from "../_lib/format";

export type ActivityItem = {
  kind: string;
  at: string;
  user_name: string | null;
  user_email: string | null;
  detail: string | null;
  writer_name: string | null;
  amount: number | null;
};

const KIND: Record<string, { label: string; dot: string }> = {
  signup: { label: "Novo leitor", dot: "bg-[#2a6fa0]" },
  purchase: { label: "Venda paga", dot: "bg-[var(--admin-good)]" },
  purchase_failed: { label: "Pagamento falhou", dot: "bg-[var(--admin-bad)]" },
  purchase_pending: { label: "Pagamento pendente", dot: "bg-[var(--admin-warn)]" },
  subscription: { label: "Assinatura", dot: "bg-[var(--liquid-accent)]" },
  book_completed: { label: "Livro concluído", dot: "bg-[#5f8f2a]" },
  writer: { label: "Novo escritor", dot: "bg-[#8f4a8a]" },
  account_deleted: { label: "Conta excluída", dot: "bg-[#a59d90]" },
};

const relative = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

export function timeAgo(value: string | Date) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "agora";
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), "hour");
  if (abs < 86_400 * 30) return relative.format(Math.round(seconds / 86_400), "day");
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function describe(item: ActivityItem) {
  const who = item.user_name || item.user_email || "Leitor";
  switch (item.kind) {
    case "signup":
      return { who, what: item.writer_name ? `entrou pelo app de ${item.writer_name}` : "criou uma conta" };
    case "purchase":
    case "purchase_failed":
    case "purchase_pending":
      return { who, what: `${item.detail ?? "publicação"} · ${item.writer_name ?? ""}`, amount: item.amount };
    case "subscription":
      return { who, what: `assinou ${item.writer_name ?? ""}` };
    case "book_completed":
      return { who, what: `terminou “${item.detail ?? "um livro"}”` };
    case "writer":
      return { who: item.writer_name ?? "Escritor", what: "entrou na plataforma" };
    case "account_deleted":
      return { who: "Um leitor", what: item.writer_name ? `excluiu a conta (${item.writer_name})` : "excluiu a conta" };
    default:
      return { who, what: item.detail ?? "" };
  }
}

export function ActivityFeed({ items, limit = 14 }: { items: ActivityItem[]; limit?: number }) {
  if (!items.length) {
    return <p className="py-6 text-center text-sm text-[var(--liquid-muted)]">Nada aconteceu ainda.</p>;
  }
  return (
    <ol className="relative">
      {items.slice(0, limit).map((item, index) => {
        const meta = KIND[item.kind] ?? { label: item.kind, dot: "bg-[#a59d90]" };
        const { who, what, amount } = describe(item);
        return (
          <li key={`${item.kind}-${item.at}-${index}`} className="relative flex gap-3 pb-3.5 last:pb-0">
            {index < Math.min(items.length, limit) - 1 && (
              <span className="absolute left-[4.5px] top-3 h-full w-px bg-[var(--admin-line)]" aria-hidden />
            )}
            <span className={cn("relative mt-[5px] size-2.5 shrink-0 rounded-full ring-[3px] ring-white", meta.dot)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="truncate">
                  <span className="font-medium text-[var(--liquid-ink)]">{who}</span>{" "}
                  <span className="text-[var(--liquid-muted)]">{what}</span>
                </span>
                {typeof amount === "number" && (
                  <span
                    className={cn(
                      "shrink-0 font-medium tabular-nums",
                      item.kind === "purchase" && "text-[var(--liquid-ink)]",
                      item.kind === "purchase_pending" && "text-[var(--liquid-muted)]",
                      item.kind === "purchase_failed" && "text-[var(--liquid-muted)] line-through",
                    )}
                  >
                    {cents(amount)}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-[var(--liquid-muted)]">
                {meta.label} · <time dateTime={new Date(item.at).toISOString()}>{timeAgo(item.at)}</time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
