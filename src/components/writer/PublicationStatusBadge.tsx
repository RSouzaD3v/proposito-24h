import { cn } from "@/lib/utils";

const STATUS: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "Publicado", className: "bg-emerald-100 text-emerald-800" },
  DRAFT: { label: "Rascunho", className: "bg-amber-100 text-amber-900" },
  ARCHIVED: { label: "Arquivado", className: "bg-slate-200 text-slate-700" },
};

export function PublicationStatusBadge({ status }: { status: string }) {
  const { label, className } = STATUS[status] ?? { label: status, className: "bg-slate-200 text-slate-700" };
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>{label}</span>;
}
