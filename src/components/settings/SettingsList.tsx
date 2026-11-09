import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="reader-eyebrow mb-2 px-1">{title}</h2>
      <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--reader-surface)]">
        {children}
      </div>
    </section>
  );
}

export function SettingsIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--muted)] text-[var(--reader-gold)]">
      <Icon className="size-[18px]" aria-hidden />
    </span>
  );
}

export function SettingsLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--muted)]/50">
      <SettingsIcon icon={icon} />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium text-[var(--liquid-ink)]">{title}</span>
        {description && <span className="block truncate text-[13px] text-[var(--liquid-muted)]">{description}</span>}
      </span>
      <ChevronRight className="size-4 shrink-0 text-[var(--liquid-muted)]" aria-hidden />
    </Link>
  );
}
