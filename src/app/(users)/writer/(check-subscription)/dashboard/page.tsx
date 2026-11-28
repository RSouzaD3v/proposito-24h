import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  BookHeart,
  BookOpen,
  Clock,
  Eye,
  HandHeart,
  PenLine,
  Quote,
  ScrollText,
  Sparkles,
  UserRoundX,
  type LucideIcon,
} from "lucide-react";
import { apiGetOrNull } from "@/lib/api/server";
import { authOptions } from "@/lib/authOption";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { KpiStrip, PageHeader, SectionLink, SectionTitle } from "@/components/ledger/Ledger";
import { PublicationStatusBadge } from "@/components/writer/PublicationStatusBadge";
import { DailyReadersChart } from "../analytics/_charts/InsightCharts";
import { BRL, dayKey, daysBetween, deltaOf, INT, PCT, type Audience, type Insights } from "../analytics/_lib/insights";

const RECENT_BOOKS = 4;
const WEEKDAY_NAMES = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

const WRITE = [
  { href: "/writer/daily/devotional/new", label: "Devocional", hint: "reflexão com versículo e áudio", icon: BookHeart },
  { href: "/writer/daily/verse/new", label: "Versículo", hint: "a passagem do dia", icon: ScrollText },
  { href: "/writer/daily/quote/new", label: "Frase", hint: "uma citação para compartilhar", icon: Quote },
  { href: "/writer/daily/prayer/new", label: "Oração", hint: "para orarem com você", icon: HandHeart },
];

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()));
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function WriterDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "WRITER_ADMIN") redirect("/login");

  const [insights, audience] = await Promise.all([
    apiGetOrNull<Insights>("/writer/analytics/insights?range=30d"),
    apiGetOrNull<Audience>("/writer/analytics/audience?range=30d"),
  ]);
  const recentBooks = insights?.books.slice(0, RECENT_BOOKS) ?? [];
  const firstName = session.user.name?.split(" ")[0] ?? "";

  const peak = audience?.heatmap.reduce<Audience["heatmap"][number] | null>(
    (best, cell) => (!best || cell.count > best.count ? cell : best),
    null,
  );
  const waiting = audience ? audience.activation.newReaders - audience.activation.activated : 0;
  const attention: { icon: LucideIcon; title: string; text: string; href: string; tone?: "bad" }[] = [];
  if (audience && audience.atRisk.count > 0) {
    attention.push({
      icon: UserRoundX,
      title: `${INT.format(audience.atRisk.count)} ${audience.atRisk.count === 1 ? "assinante sumido" : "assinantes sumidos"}`,
      text: `Sem abrir o app há ${audience.riskDays} dias ou mais. Um recado pode trazê-los de volta.`,
      href: "/writer/analytics/readers?filter=risk",
      tone: "bad",
    });
  }
  if (peak) {
    attention.push({
      icon: Clock,
      title: `Pico de leitura: ${WEEKDAY_NAMES[peak.weekday - 1]}, ${String(peak.hour).padStart(2, "0")}h`,
      text: "Deixe o conteúdo do dia pronto antes desse horário.",
      href: "/writer/analytics/audience",
    });
  }
  if (waiting > 0) {
    attention.push({
      icon: Sparkles,
      title: `${INT.format(waiting)} ${waiting === 1 ? "novo leitor ainda não leu" : "novos leitores ainda não leram"}`,
      text: "Chegaram nos últimos 30 dias e não concluíram nenhum conteúdo.",
      href: "/writer/analytics/readers?filter=new",
    });
  }
  if (audience && audience.streaks.atLeast7 > 0) {
    attention.push({
      icon: BookOpen,
      title: `${INT.format(audience.streaks.atLeast7)} em sequência de 7+ dias`,
      text: `A maior sequência ativa é de ${INT.format(audience.streaks.longest)} dias seguidos.`,
      href: "/writer/analytics/audience",
    });
  }

  const days = audience ? daysBetween(audience.start, audience.end) : [];
  const daily = new Map(audience?.dailyActive.map(({ day, readers }) => [dayKey(day), readers]) ?? []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-14 pt-5 md:px-10 md:pt-9">
      <PageHeader
        eyebrow={new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" })}
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        description="Seu ministério nos últimos 30 dias."
        actions={
          <>
            <Button asChild variant="outline" className="h-9 gap-2">
              <Link href="/writer/publications/my-vitrine">
                <Eye className="size-4" aria-hidden /> Ver como leitor
              </Link>
            </Button>
            <Button asChild className="h-9 gap-2 bg-[var(--liquid-ink)] text-white hover:bg-[#35312a]">
              <Link href="/writer/daily/devotional/new">
                <PenLine className="size-4" aria-hidden /> Escrever devocional
              </Link>
            </Button>
          </>
        }
      />

      {insights && (
        <KpiStrip
          items={[
            {
              label: "Receita líquida",
              value: BRL.format(insights.current.netCents / 100),
              delta: deltaOf(insights.current.netCents, insights.previous.netCents),
              href: "/writer/analytics",
            },
            {
              label: "Novos assinantes",
              value: INT.format(insights.current.newSubs),
              delta: deltaOf(insights.current.newSubs, insights.previous.newSubs),
              href: "/writer/analytics",
            },
            {
              label: "Leitores ativos",
              value: INT.format(insights.activeReaders),
              hint: "abriram o app",
              href: "/writer/analytics/audience",
            },
            {
              label: "Leituras concluídas",
              value: INT.format(insights.current.completions),
              delta: deltaOf(insights.current.completions, insights.previous.completions),
              href: "/writer/analytics/audience",
            },
            ...(audience
              ? [{ label: "Constância", value: PCT.format(audience.stickiness), hint: "voltam num dia qualquer", href: "/writer/analytics/audience" }]
              : []),
          ]}
        />
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          {audience && (
            <GlassCard>
              <SectionTitle
                title="Leitores por dia"
                description="Pessoas que concluíram ao menos um conteúdo diário."
                action={<SectionLink href="/writer/analytics/audience">Audiência</SectionLink>}
              />
              <DailyReadersChart data={days.map(({ key, label }) => ({ label, value: daily.get(key) ?? 0 }))} />
            </GlassCard>
          )}

          <GlassCard padding="none" className="overflow-hidden">
            <div className="p-5 pb-2">
              <SectionTitle
                title="Continue escrevendo"
                description="Seus livros mais recentes."
                action={<SectionLink href="/writer/publications">Todos os livros</SectionLink>}
              />
            </div>
            {recentBooks.length === 0 ? (
              <div className="px-5 pb-5">
                <Link
                  href="/writer/publications/create"
                  className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-[var(--admin-line)] px-4 py-5 text-sm text-[var(--liquid-muted)] transition-colors hover:bg-[var(--admin-sunken)]"
                >
                  Você ainda não tem livros. Comece o primeiro.
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--admin-line-soft)]">
                {recentBooks.map((book) => (
                  <li key={book.id}>
                    <Link
                      href={`/writer/publications/${book.slug}/chapters`}
                      className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[#faf8f4]"
                    >
                      <span className="relative block aspect-[2/3] w-10 shrink-0 overflow-hidden rounded-[4px] bg-[var(--admin-sunken)] shadow-[0_0_0_1px_var(--admin-line)]">
                        {book.coverUrl && (
                          <img src={book.coverUrl} alt="" className="absolute inset-0 size-full object-cover" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-medium text-[var(--liquid-ink)]">{book.title}</span>
                          <PublicationStatusBadge status={book.status} />
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--liquid-muted)]">
                          {INT.format(book.chapters)} {book.chapters === 1 ? "capítulo" : "capítulos"} · {INT.format(book.words)} palavras ·{" "}
                          {INT.format(book.readers)} {book.readers === 1 ? "leitor" : "leitores"} no mês
                        </span>
                      </span>
                      <PenLine className="size-4 shrink-0 text-[var(--liquid-muted)] transition-colors group-hover:text-[var(--liquid-accent)]" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>

        <div className="grid content-start gap-4">
          <GlassCard padding="none" className="overflow-hidden">
            <div className="p-5 pb-2">
              <SectionTitle title="Escrever hoje" description="O conteúdo diário que seus leitores recebem." />
            </div>
            <ul className="divide-y divide-[var(--admin-line-soft)]">
              {WRITE.map(({ href, label, hint, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="group flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-[#faf8f4]">
                    <Icon className="size-4 shrink-0 text-[var(--liquid-accent)]" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[var(--liquid-ink)]">{label}</span>
                      <span className="block truncate text-xs text-[var(--liquid-muted)]">{hint}</span>
                    </span>
                    <ArrowRight className="size-4 text-[var(--liquid-muted)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-[var(--admin-line-soft)] px-5 py-3 text-xs text-[var(--liquid-muted)]">
              Muitos de uma vez?{" "}
              <Link href="/writer/imports" className="font-medium text-[var(--liquid-ink)] underline underline-offset-4">
                Importe uma planilha
              </Link>
              .
            </div>
          </GlassCard>

          <GlassCard padding="none" className="overflow-hidden">
            <div className="p-5 pb-2">
              <SectionTitle title="Para sua atenção" description="O que os números dizem sobre seus leitores." />
            </div>
            {attention.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-[var(--liquid-muted)]">
                Tudo em ordem. Assim que seus leitores começarem a ler, as dicas aparecem aqui.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--admin-line-soft)]">
                {attention.map(({ icon: Icon, title, text, href, tone }) => (
                  <li key={title}>
                    <Link href={href} className="group flex gap-3 px-5 py-3 transition-colors hover:bg-[#faf8f4]">
                      <Icon
                        className={tone === "bad" ? "mt-0.5 size-4 shrink-0 text-[var(--admin-bad)]" : "mt-0.5 size-4 shrink-0 text-[var(--liquid-accent)]"}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[var(--liquid-ink)]">{title}</span>
                        <span className="block text-xs leading-relaxed text-[var(--liquid-muted)]">{text}</span>
                      </span>
                      <ArrowRight className="mt-0.5 size-4 shrink-0 text-[var(--liquid-muted)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
