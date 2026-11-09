import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Check, Feather, HandHeart, Lock, Quote } from "lucide-react";
import type { HomeCard, ReaderHome } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import AudioButton from "./devotional/devotional/AudioButton";

interface Step {
  key: string;
  label: string;
  title?: string;
  empty: string;
  href: string;
  scene: string;
  icon: LucideIcon;
  item: HomeCard | null;
}

export function buildSteps(home: ReaderHome): Step[] {
  const { quote, verse, devotional, prayer } = home;
  return [
    { key: "quote", label: "Reflexão", title: quote?.nameAuthor, empty: "Nenhuma citação hoje", href: `/reader/area/quote/${quote?.id}`, scene: "reader-scene-dusk", icon: Quote, item: quote },
    { key: "verse", label: "Palavra", title: verse?.reference, empty: "Nenhum versículo hoje", href: `/reader/area/verse/${verse?.id}`, scene: "reader-scene-night", icon: BookOpen, item: verse },
    { key: "devotional", label: "Devocional", title: devotional?.title, empty: "Nenhum devocional hoje", href: `/reader/area/devotional/${devotional?.id}`, scene: "reader-scene-dawn", icon: Feather, item: devotional },
    { key: "prayer", label: "Oração", title: prayer?.title, empty: "Nenhuma oração hoje", href: `/reader/area/prayer/${prayer?.id}`, scene: "reader-scene-olive", icon: HandHeart, item: prayer },
  ];
}

export function DailyJourney({ steps }: { steps: Step[] }) {
  const available = steps.filter((step) => step.item);
  const done = available.filter((step) => step.item!.completed).length;
  const percent = available.length ? Math.round((done / available.length) * 100) : 0;

  return (
    <section aria-labelledby="daily-journey">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="reader-eyebrow">Passo a passo</p>
          <h2 id="daily-journey" className="mt-1 text-2xl">Sua jornada de hoje</h2>
        </div>
        {available.length > 0 && (
          <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--liquid-muted)]">
            {done} de {available.length}
          </p>
        )}
      </div>

      {available.length > 0 && (
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]" aria-hidden>
          <div className="h-full rounded-full bg-[var(--reader-gold)] transition-all duration-700" style={{ width: `${percent}%` }} />
        </div>
      )}

      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step.key} className="animate-glass-in" style={{ animationDelay: `${index * 70}ms` }}>
            <StepCard step={step} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function StepCard({ step }: { step: Step }) {
  const { item, icon: Icon } = step;
  const imageUrl = item?.imageUrl;

  const body = (
    <>
      <span className={cn("reader-scene flex size-16 shrink-0 items-center justify-center rounded-2xl", step.scene)}>
        {imageUrl && <img src={imageUrl} alt="" />}
        <Icon className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="reader-eyebrow block">{step.label}</span>
        <span className="reader-serif mt-1 line-clamp-2 text-[1.0625rem] leading-snug text-[var(--liquid-ink)]">
          {item ? step.title : step.empty}
        </span>
      </span>
    </>
  );

  if (!item) {
    return <div className="glass-surface flex items-center gap-4 p-3 pr-4 opacity-60">{body}</div>;
  }

  return (
    <div className="glass-surface-strong flex items-center gap-2 p-3 pr-4 transition-transform motion-safe:hover:-translate-y-0.5">
      <Link href={step.href} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl">
        {body}
      </Link>
      <AudioButton src={item.locked ? null : item.audioUrl} />
      {item.locked ? (
        <span title="Conteúdo exclusivo" className="flex size-8 shrink-0 items-center justify-center text-[var(--liquid-muted)]">
          <Lock className="size-4" aria-label="Conteúdo exclusivo" />
        </span>
      ) : (
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
            item.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-[var(--input)] text-transparent",
          )}
        >
          <Check className="size-4" strokeWidth={3} aria-label={item.completed ? "Concluído" : "Pendente"} />
        </span>
      )}
    </div>
  );
}
