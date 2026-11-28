// app/admin/widget/page.tsx
import { BookOpen, Clock, Smartphone, Type } from "lucide-react";
import { apiGet, apiPublicGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { requireAdmin } from "../_lib/auth";
import { INT } from "../_lib/format";
import { StatTile } from "../_components/StatTile";
import {
  type BibleBook,
  type BibleVersion,
  circleLabel,
  DeleteWidgetVerseButton,
  LockScreenPreview,
  WidgetActiveSwitch,
  type WidgetVerse,
  WidgetVerseDialog,
} from "./_components/WidgetControls";

export const dynamic = "force-dynamic";

export default async function AdminWidgetPage() {
  await requireAdmin();
  const [items, books, versions] = await Promise.all([
    apiGet<WidgetVerse[]>("/admin/widget-verses"),
    apiPublicGet<BibleBook[]>("/bible/books", 86_400),
    apiPublicGet<BibleVersion[]>("/bible/versions", 86_400),
  ]);
  const bookList = books ?? [];
  const versionList = versions ?? [];

  const active = items.filter((item) => item.active);
  const fromBible = items.filter((item) => item.book).length;
  const sample = active[0];

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 animate-glass-in sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Widget</h1>
          <p className="text-sm text-[var(--liquid-muted)]">
            Versículos e frases da tela de bloqueio. O app sorteia entre os ativos e troca de hora em hora, para todos os leitores.
          </p>
        </div>
        <WidgetVerseDialog books={bookList} versions={versionList} />
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Itens" value={INT.format(items.length)} icon={Smartphone} tone="violet" hint={`${INT.format(active.length)} ativos`} />
        <StatTile label="Da Bíblia" value={INT.format(fromBible)} icon={BookOpen} tone="blue" />
        <StatTile label="Avulsos" value={INT.format(items.length - fromBible)} icon={Type} tone="green" />
        <StatTile
          label="Ciclo completo"
          value={active.length ? `${INT.format(active.length)} h` : "—"}
          icon={Clock}
          tone="orange"
          hint="tempo para passar por todos"
        />
      </div>

      {items.length === 0 ? (
        <GlassCard strong className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--admin-sunken)] text-[var(--liquid-ink)]">
            <Smartphone className="size-6" aria-hidden />
          </span>
          <p className="font-medium text-[var(--liquid-ink)]">Nenhum item no widget ainda</p>
          <p className="max-w-sm text-sm text-[var(--liquid-muted)]">
            Escolha trechos da Bíblia ou escreva frases curtas. Sem itens ativos, o widget mostra o versículo do dia do escritor.
          </p>
          <WidgetVerseDialog books={bookList} versions={versionList} />
        </GlassCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <GlassCard strong padding="none" className="divide-y divide-white/60 overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className={cn("flex items-start gap-4 px-5 py-4", !item.active && "opacity-60")}>
                <span className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-full bg-[#a0582a]/12 text-center text-[10px] font-semibold leading-tight text-[#a0582a]">
                  {circleLabel(item) || "✝"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--liquid-ink)]">{item.shortText}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-[var(--liquid-muted)]">
                    {item.reference && <span>{item.reference}</span>}
                    {item.versionCode && <span className="rounded bg-white/60 px-1.5 py-0.5 font-semibold">{item.versionCode}</span>}
                    {!item.book && <span className="rounded bg-white/60 px-1.5 py-0.5 font-semibold">Avulso</span>}
                    {item.inlineText && <span>· Linha: “{item.inlineText}”</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <WidgetActiveSwitch id={item.id} active={item.active} />
                  <WidgetVerseDialog item={item} books={bookList} versions={versionList} />
                  <DeleteWidgetVerseButton id={item.id} label={item.reference || item.shortText.slice(0, 30)} />
                </div>
              </div>
            ))}
          </GlassCard>

          <div className="hidden lg:block">
            <LockScreenPreview
              shortText={sample?.shortText ?? ""}
              inlineText={sample?.inlineText ?? ""}
              reference={sample?.reference ?? ""}
              circle={sample ? circleLabel(sample) : ""}
            />
            <p className="mt-2 text-center text-xs text-[var(--liquid-muted)]">
              {sample ? "Exemplo com o primeiro item ativo." : "Nenhum item ativo."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
