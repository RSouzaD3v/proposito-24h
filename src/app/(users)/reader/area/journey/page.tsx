import { apiGet } from "@/lib/api/server";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import { BookOpen, Feather, Quote } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const GOAL = 365;

const ACHIEVEMENTS = [
  { key: "devotional", img: "/achievements/devotional.gif", label: "365 dias de devocionais" },
  { key: "verse", img: "/achievements/verse.gif", label: "365 dias de versículos" },
  { key: "quote", img: "/achievements/quote.gif", label: "365 dias de citações" },
  { key: "all", img: "/achievements/365.gif", label: "365 dias completos" },
];

export default async function JourneyPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const journey = await apiGet<{ devotionals: number; verses: number; quotes: number; achievements: string[] }>("/reader/journey");
  const total = journey.devotionals + journey.verses + journey.quotes;
  const earned = ACHIEVEMENTS.filter(({ key }) => journey.achievements.includes(key));

  return (
    <>
      <header className="reader-scene reader-scene-olive rounded-b-[2.5rem]">
        <div className="mx-auto flex min-h-[20rem] w-full max-w-2xl flex-col justify-end px-5 pb-8 pt-20">
          <p className="reader-eyebrow" style={{ color: "rgb(255 255 255 / 0.82)" }}>Minha jornada</p>
          <p className="reader-serif mt-2 text-7xl leading-none tabular-nums">{total}</p>
          <p className="mt-2 text-base text-white/85">
            {total === 1 ? "momento com Deus registrado" : "momentos com Deus registrados"}
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl space-y-8 px-5 pt-6">
        <section className="space-y-3">
          <Progress icon={Feather} label="Devocionais" value={journey.devotionals} />
          <Progress icon={BookOpen} label="Versículos" value={journey.verses} />
          <Progress icon={Quote} label="Citações" value={journey.quotes} />
        </section>

        <section>
          <p className="reader-eyebrow">Marcos</p>
          <h2 className="mb-4 mt-1 text-2xl">Minhas conquistas</h2>
          {earned.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {earned.map(({ key, img, label }) => (
                <GlassCard key={key} strong padding="sm" className="flex flex-col items-center gap-2 text-center">
                  <img src={img} alt="" className="size-20 rounded-full object-cover" />
                  <span className="text-xs font-semibold">{label}</span>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard strong className="text-center text-sm text-[var(--liquid-muted)]">
              Sua primeira conquista chega ao completar 365 dias. Continue um dia de cada vez.
            </GlassCard>
          )}
        </section>
      </div>
    </>
  );
}

function Progress({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  const percent = Math.min(100, (value / GOAL) * 100);
  return (
    <GlassCard strong padding="sm" className="flex items-center gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--reader-gold)]">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-sm tabular-nums text-[var(--liquid-muted)]">
            <strong className="font-bold text-[var(--liquid-ink)]">{value}</strong> / {GOAL}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]" aria-hidden>
          <div className="h-full rounded-full bg-[var(--reader-gold)]" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </GlassCard>
  );
}
