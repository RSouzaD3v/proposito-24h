import Link from "next/link";
import { notFound } from "next/navigation";
import { Flame } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { KpiStrip, PageHeader, RangeTabs, SectionLink, SectionTitle } from "@/components/ledger/Ledger";
import { CHART, HEAT, SERIES as PALETTE, heatColor } from "@/components/ledger/palette";
import { rangeOf } from "@/components/ledger/ranges";
import { apiFetch } from "@/lib/api/server";
import { DailyReadersChart, ReminderHoursChart, SERIES } from "../_charts/InsightCharts";
import { Meter } from "../_components/Meter";
import { DECIMAL, INT, KIND_LABEL, PCT, dayKey, daysBetween, hoursLabel, timeAgo, type Audience } from "../_lib/insights";

export const metadata = { title: "Audiência — Insights" };

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const WEEKDAY_NAMES = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const RECENCY = [
  { key: "day", label: "Últimas 24 horas", color: HEAT[5] },
  { key: "week", label: "Nesta semana", color: HEAT[4] },
  { key: "month", label: "Neste mês", color: HEAT[3] },
  { key: "quarter", label: "De 1 a 3 meses", color: HEAT[2] },
  { key: "dormant", label: "Há mais de 3 meses", color: HEAT[1] },
  { key: "never", label: "Nunca abriram o app", color: CHART.neutral },
] as const;

const FREQUENCY = [
  { key: "1", label: "1 dia" },
  { key: "2-3", label: "2 a 3 dias" },
  { key: "4-7", label: "4 a 7 dias" },
  { key: "8-14", label: "8 a 14 dias" },
  { key: "15+", label: "15 dias ou mais" },
];

const PLATFORM_LABEL: Record<string, string> = { ios: "iPhone", android: "Android" };

const DAY_PARTS = [
  { label: "madrugada", from: 0, to: 5 },
  { label: "manhã", from: 6, to: 11 },
  { label: "tarde", from: 12, to: 17 },
  { label: "noite", from: 18, to: 23 },
];

const ratio = (part: number, total: number) => (total ? part / total : 0);
const hh = (hour: number) => `${String(hour).padStart(2, "0")}h`;

export default async function AudiencePage({ searchParams }: { searchParams?: Promise<{ range?: string }> }) {
  const range = rangeOf((await searchParams)?.range);
  const response = await apiFetch<Audience>(`/writer/analytics/audience?range=${range.key}`);
  if (!response.ok) return notFound();
  const data = response.data;

  // Mapa de calor: dia da semana × hora local do leitor.
  const cells = new Map(data.heatmap.map(({ weekday, hour, count }) => [`${weekday}:${hour}`, count]));
  const heatMax = Math.max(0, ...data.heatmap.map(({ count }) => count));
  const totalReads = data.heatmap.reduce((sum, { count }) => sum + count, 0);
  const peak = data.heatmap.reduce<Audience["heatmap"][number] | null>((best, cell) => (!best || cell.count > best.count ? cell : best), null);
  const byWeekday = WEEKDAYS.map((_, index) =>
    data.heatmap.filter(({ weekday }) => weekday === index + 1).reduce((sum, { count }) => sum + count, 0),
  );
  const bestWeekday = byWeekday.indexOf(Math.max(...byWeekday));
  const parts = DAY_PARTS.map((part) => ({
    ...part,
    count: data.heatmap.filter(({ hour }) => hour >= part.from && hour <= part.to).reduce((sum, { count }) => sum + count, 0),
  }));
  const bestPart = parts.reduce((best, part) => (part.count > best.count ? part : best), parts[0]);

  const days = daysBetween(data.start, data.end);
  const daily = new Map(data.dailyActive.map(({ day, readers }) => [dayKey(day), readers]));

  const recency = new Map(data.recency.map(({ bucket, readers }) => [bucket, readers]));
  const recencyTotal = data.recency.reduce((sum, { readers }) => sum + readers, 0);
  const frequency = new Map(data.frequency.map(({ bucket, readers }) => [bucket, readers]));
  const frequencyMax = Math.max(1, ...data.frequency.map(({ readers }) => readers));
  const loyal = (frequency.get("8-14") ?? 0) + (frequency.get("15+") ?? 0);

  const mixTotal = data.contentMix.reduce((sum, { count }) => sum + count, 0);
  const highlightMax = Math.max(1, ...data.highlights.map(({ readers }) => readers));
  const platformsTotal = data.devices.platforms.reduce((sum, { readers }) => sum + readers, 0);
  const reminderHours = new Map(data.devices.reminderHours.map(({ hour, readers }) => [hour, readers]));
  const reminderPeak = data.devices.reminderHours.reduce<{ hour: number; readers: number } | null>(
    (best, row) => (!best || row.readers > best.readers ? row : best),
    null,
  );
  const activationRate = ratio(data.activation.activated, data.activation.newReaders);

  return (
    <section className="w-full space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="Audiência"
        description="Quem lê você, em que horário, com que constância e se volta depois."
        actions={<RangeTabs current={range.key} />}
      />

      <KpiStrip
        items={[
          { label: "Leram no período", value: INT.format(data.engagedReaders), hint: `de ${INT.format(data.totalReaders)} leitores` },
          { label: "Leitores por dia", value: DECIMAL.format(data.averageDailyReaders), hint: "média diária" },
          { label: "Constância", value: PCT.format(data.stickiness), hint: "voltam num dia qualquer" },
          { label: "Dias com leitura", value: DECIMAL.format(data.averageActiveDays), hint: "média por leitor" },
          { label: "Em sequência", value: INT.format(data.streaks.active), hint: `${INT.format(data.streaks.atLeast7)} com 7+ dias` },
          {
            label: "Ativação",
            value: data.activation.newReaders ? PCT.format(activationRate) : "—",
            hint: `dos ${INT.format(data.activation.newReaders)} novos já leram`,
          },
        ]}
      />

      {/* Quando leem */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <GlassCard>
          <SectionTitle
            title="Quando seus leitores leem"
            description="Conclusões por dia da semana e hora, no horário de Brasília."
          />
          {totalReads === 0 ? (
            <Empty>Nenhuma leitura concluída no período. O mapa aparece com as primeiras conclusões.</Empty>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] border-separate border-spacing-[3px]" aria-label="Leituras por dia da semana e hora">
                  <thead>
                    <tr>
                      <th className="w-9" />
                      {HOURS.map((hour) => (
                        <th key={hour} scope="col" className="text-[10px] font-medium tabular-nums text-[var(--liquid-muted)]">
                          {hour % 3 === 0 ? hour : <span className="sr-only">{hour}</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKDAYS.map((label, index) => (
                      <tr key={label}>
                        <th scope="row" className="pr-1 text-left text-[11px] font-medium text-[var(--liquid-muted)]">
                          {label}
                        </th>
                        {HOURS.map((hour) => {
                          const count = cells.get(`${index + 1}:${hour}`) ?? 0;
                          return (
                            <td
                              key={hour}
                              className="h-6 rounded-[3px]"
                              style={{ background: heatColor(count, heatMax) }}
                              title={`${label} ${hh(hour)}: ${INT.format(count)} ${count === 1 ? "leitura" : "leituras"}`}
                            >
                              <span className="sr-only">{count}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[var(--liquid-muted)]">
                <span className="flex items-center gap-1.5">
                  menos
                  {HEAT.map((color) => (
                    <span key={color} className="size-3 rounded-[3px]" style={{ background: color }} aria-hidden />
                  ))}
                  mais
                </span>
                <span>{INT.format(totalReads)} leituras concluídas</span>
              </div>
            </>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col">
          <SectionTitle title="O melhor momento para publicar" description="Onde suas palavras encontram mais gente." />
          {peak ? (
            <dl className="grid gap-4">
              <Fact label="Horário de pico" value={`${WEEKDAY_NAMES[peak.weekday - 1]}, ${hh(peak.hour)}`}>
                {INT.format(peak.count)} leituras nesse horário
              </Fact>
              <Fact label="Dia mais forte" value={WEEKDAY_NAMES[bestWeekday]}>
                {PCT.format(ratio(byWeekday[bestWeekday], totalReads))} das leituras da semana
              </Fact>
              <Fact label="Período do dia" value={bestPart.label}>
                {PCT.format(ratio(bestPart.count, totalReads))} das leituras acontecem de {hh(bestPart.from)} a {hh(bestPart.to)}
              </Fact>
              <p className="rounded-lg bg-[var(--admin-sunken)] px-3.5 py-3 text-[13px] leading-relaxed text-[var(--liquid-ink)]">
                Deixe o conteúdo do dia pronto antes das {hh(Math.max(0, peak.hour - 1))} de {WEEKDAY_NAMES[peak.weekday - 1]} — é quando
                mais leitores abrem o app.
              </p>
            </dl>
          ) : (
            <Empty>Assim que houver leituras, mostramos aqui o melhor horário.</Empty>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <SectionTitle
          title="Leitores por dia"
          description="Pessoas diferentes que concluíram ao menos um conteúdo diário em cada dia."
        />
        <DailyReadersChart data={days.map(({ key, label }) => ({ label, value: daily.get(key) ?? 0 }))} />
      </GlassCard>

      {/* Saúde e constância */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle
            title="Saúde da base"
            description="Último acesso de cada leitor, independente do período."
            action={<SectionLink href="/writer/analytics/readers?filter=risk">Assinantes sumidos</SectionLink>}
          />
          {recencyTotal === 0 ? (
            <Empty>Nenhum leitor cadastrado ainda.</Empty>
          ) : (
            <>
              <div className="flex h-3 overflow-hidden rounded-full bg-[var(--admin-sunken)]" role="img" aria-label="Distribuição do último acesso">
                {RECENCY.map(({ key, color }) => {
                  const value = recency.get(key) ?? 0;
                  return value ? <span key={key} style={{ width: `${ratio(value, recencyTotal) * 100}%`, background: color }} /> : null;
                })}
              </div>
              <ul className="mt-4 grid gap-2">
                {RECENCY.map(({ key, label, color }) => {
                  const value = recency.get(key) ?? 0;
                  return (
                    <li key={key} className="flex items-center gap-2.5 text-sm">
                      <span className="size-2.5 shrink-0 rounded-sm" style={{ background: color }} aria-hidden />
                      <span className="flex-1 text-[var(--liquid-ink)]">{label}</span>
                      <span className="tabular-nums text-[var(--liquid-muted)]">{PCT.format(ratio(value, recencyTotal))}</span>
                      <span className="w-12 text-right font-semibold tabular-nums text-[var(--liquid-ink)]">{INT.format(value)}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </GlassCard>

        <GlassCard>
          <SectionTitle
            title="Constância de leitura"
            description="Em quantos dias diferentes cada leitor leu no período."
          />
          {data.engagedReaders === 0 ? (
            <Empty>Ninguém concluiu conteúdo no período.</Empty>
          ) : (
            <>
              <ul className="grid gap-3">
                {FREQUENCY.map(({ key, label }) => (
                  <Meter key={key} label={label} value={frequency.get(key) ?? 0} max={frequencyMax} />
                ))}
              </ul>
              <p className="mt-4 text-[13px] text-[var(--liquid-muted)]">
                <strong className="font-semibold text-[var(--liquid-ink)]">{INT.format(loyal)}</strong>{" "}
                {loyal === 1 ? "leitor fiel leu" : "leitores fiéis leram"} em 8 dias ou mais. A maior sequência ativa é de{" "}
                <strong className="font-semibold text-[var(--liquid-ink)]">{INT.format(data.streaks.longest)}</strong>{" "}
                {data.streaks.longest === 1 ? "dia" : "dias seguidos"}.
              </p>
            </>
          )}
        </GlassCard>
      </div>

      {/* Retenção */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <GlassCard padding="none" className="overflow-hidden">
          <div className="p-5 pb-0">
            <SectionTitle
              title="Retenção por semana de cadastro"
              description="Dos leitores que chegaram em cada semana, quantos leram de novo nas semanas seguintes."
            />
          </div>
          {data.cohorts.length === 0 ? (
            <div className="px-5 pb-5">
              <Empty>Nenhum leitor novo nas últimas 8 semanas.</Empty>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full min-w-[36rem] text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--admin-line-soft)] text-left text-xs text-[var(--liquid-muted)]">
                    <th className="px-5 py-2 font-medium">Semana</th>
                    <th className="px-2 py-2 text-right font-medium">Leitores</th>
                    {Array.from({ length: 8 }, (_, week) => (
                      <th key={week} className="px-1 py-2 text-center font-medium">
                        {week === 0 ? "1ª sem." : `+${week}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.cohorts.map((cohort) => (
                    <tr key={cohort.week}>
                      <td className="whitespace-nowrap px-5 py-1.5 text-[var(--liquid-ink)]">
                        {new Date(cohort.week).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" })}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-[var(--liquid-muted)]">{INT.format(cohort.size)}</td>
                      {Array.from({ length: 8 }, (_, week) => {
                        const value = cohort.weeks[week];
                        if (value === undefined) return <td key={week} className="px-1 py-1.5" />;
                        const share = ratio(value, cohort.size);
                        return (
                          <td key={week} className="px-1 py-1.5">
                            <span
                              className="block rounded-[4px] py-1 text-center text-[12px] font-medium tabular-nums"
                              style={{ background: heatColor(share, 1), color: share >= 0.6 ? "#fff" : "var(--liquid-ink)" }}
                              title={`${INT.format(value)} de ${INT.format(cohort.size)} leitores`}
                            >
                              {PCT.format(share)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Primeiros passos" description="O que acontece com quem acabou de chegar." />
          <dl className="grid gap-4">
            <Fact label="Novos leitores no período" value={INT.format(data.activation.newReaders)}>
              {INT.format(data.activation.activated)} já concluíram ao menos um conteúdo
            </Fact>
            <Fact label="Tempo até a primeira leitura" value={hoursLabel(data.activation.medianHoursToFirstRead)}>
              mediana entre o cadastro e a primeira conclusão
            </Fact>
            <Fact label="Leitores de livros" value={INT.format(data.books.readers)}>
              abriram um livro seu no período · {INT.format(data.books.finished)} terminaram
            </Fact>
          </dl>
        </GlassCard>
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle title="O que mais leem" description="Conclusões por tipo de conteúdo diário." />
          {mixTotal === 0 ? (
            <Empty>Nenhuma conclusão no período.</Empty>
          ) : (
            <ul className="grid gap-3">
              {data.contentMix
                .slice()
                .sort((a, b) => b.count - a.count)
                .map((row) => (
                  <Meter
                    key={row.kind}
                    label={KIND_LABEL[row.kind] ?? row.kind}
                    value={row.count}
                    max={mixTotal}
                    color={SERIES[row.kind as keyof typeof SERIES] ?? CHART.primary}
                    detail={`${PCT.format(ratio(row.count, mixTotal))} · ${INT.format(row.readers)} leitores`}
                  />
                ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Versículos mais grifados" description="Marcados na Bíblia pelos seus leitores no período." />
          {data.highlights.length === 0 ? (
            <Empty>Nenhum versículo grifado no período.</Empty>
          ) : (
            <ol className="grid gap-3">
              {data.highlights.map((row) => (
                <Meter
                  key={`${row.book}:${row.chapter}:${row.verse}`}
                  label={`${row.book} ${row.chapter}:${row.verse}`}
                  value={row.readers}
                  max={highlightMax}
                  color={PALETTE[3]}
                  detail={`${INT.format(row.readers)} ${row.readers === 1 ? "leitor" : "leitores"}`}
                />
              ))}
            </ol>
          )}
        </GlassCard>
      </div>

      <GlassCard padding="none" className="overflow-hidden">
        <div className="p-5 pb-0">
          <SectionTitle
            title="Jornadas"
            description="Quantos começaram, seguem e concluíram cada jornada (histórico completo)."
            action={<SectionLink href="/writer/group-daily">Gerenciar</SectionLink>}
          />
        </div>
        {data.journeys.length === 0 ? (
          <div className="px-5 pb-5">
            <Empty>Você ainda não criou jornadas.</Empty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="border-y border-[var(--admin-line-soft)] text-left text-xs text-[var(--liquid-muted)]">
                  <th className="px-5 py-2 font-medium">Jornada</th>
                  <th className="px-3 py-2 text-right font-medium">Começaram</th>
                  <th className="px-3 py-2 text-right font-medium">No período</th>
                  <th className="px-3 py-2 text-right font-medium">Em andamento</th>
                  <th className="px-3 py-2 text-right font-medium">Concluíram</th>
                  <th className="px-5 py-2 text-right font-medium">Conclusão</th>
                </tr>
              </thead>
              <tbody>
                {data.journeys.map((journey) => (
                  <tr key={journey.id} className="border-b border-[var(--admin-line-soft)] last:border-0">
                    <td className="px-5 py-2.5">
                      <Link href={`/writer/group-daily/${journey.id}`} className="font-medium text-[var(--liquid-ink)] underline-offset-4 hover:underline">
                        {journey.title}
                      </Link>
                      {!journey.active && <span className="ml-2 text-xs text-[var(--liquid-muted)]">inativa</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{INT.format(journey.started)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{INT.format(journey.recent)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{INT.format(journey.reading)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{INT.format(journey.completed)}</td>
                    <td className="px-5 py-2.5 text-right font-semibold tabular-nums">
                      {journey.started ? PCT.format(ratio(journey.completed, journey.started)) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Canais */}
      <GlassCard>
        <SectionTitle title="App e lembretes" description="Por onde seus leitores recebem você (situação atual)." />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="grid content-start gap-4">
            <dl className="grid grid-cols-2 gap-4">
              <Fact label="Usam o app" value={INT.format(data.devices.appReaders)}>
                {PCT.format(ratio(data.devices.appReaders, data.totalReaders))} da base
              </Fact>
              <Fact label="Lembrete diário" value={INT.format(data.devices.dailyReminder)}>
                ativado no celular
              </Fact>
              <Fact label="Lembrete de oração" value={INT.format(data.devices.prayerReminder)}>
                ativado no celular
              </Fact>
              <Fact label="Avisos de novidade" value={INT.format(data.devices.newContentAlerts)}>
                + {INT.format(data.devices.webPush)} no navegador
              </Fact>
            </dl>
            {platformsTotal > 0 && (
              <ul className="grid gap-3">
                {data.devices.platforms.map(({ platform, readers }, index) => (
                  <Meter
                    key={platform}
                    label={PLATFORM_LABEL[platform] ?? platform}
                    value={readers}
                    max={platformsTotal}
                    color={PALETTE[index % PALETTE.length]}
                    detail={`${PCT.format(ratio(readers, platformsTotal))} · ${INT.format(readers)}`}
                  />
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-1 text-[13px] font-medium text-[var(--liquid-ink)]">Horário escolhido para o lembrete diário</p>
            <p className="mb-3 text-xs text-[var(--liquid-muted)]">
              {reminderPeak
                ? `A maioria pediu para ser lembrada às ${hh(reminderPeak.hour)} — publique antes disso.`
                : "Nenhum leitor ativou o lembrete diário ainda."}
            </p>
            <ReminderHoursChart data={HOURS.map((hour) => ({ label: hh(hour), value: reminderHours.get(hour) ?? 0 }))} />
          </div>
        </div>
      </GlassCard>

      {/* Pessoas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard padding="none" className="overflow-hidden">
          <div className="p-5 pb-2">
            <SectionTitle title="Leitores mais fiéis" description="Quem leu em mais dias no período." />
          </div>
          {data.topReaders.length === 0 ? (
            <div className="px-5 pb-5">
              <Empty>Ninguém concluiu conteúdo no período.</Empty>
            </div>
          ) : (
            <ol className="divide-y divide-[var(--admin-line-soft)]">
              {data.topReaders.map((person, index) => (
                <li key={person.id}>
                  <Link
                    href={`/writer/analytics/readers/${person.id}`}
                    className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-[#faf8f4]"
                  >
                    <span className="w-4 text-right text-xs tabular-nums text-[var(--liquid-muted)]">{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[var(--liquid-ink)]">{person.name || "Sem nome"}</span>
                      <span className="block text-xs text-[var(--liquid-muted)]">
                        {INT.format(person.days)} {person.days === 1 ? "dia" : "dias"} · {INT.format(person.completions)} leituras ·
                        última {timeAgo(person.last)}
                      </span>
                    </span>
                    {person.streak > 1 && (
                      <span className="flex items-center gap-1 text-xs font-semibold tabular-nums text-[var(--liquid-accent)]" title="Dias seguidos lendo">
                        <Flame className="size-3.5" aria-hidden /> {person.streak}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </GlassCard>

        <GlassCard padding="none" className="overflow-hidden">
          <div className="p-5 pb-2">
            <SectionTitle
              title="Assinantes em risco"
              description={`Assinantes ativos sem abrir o app há ${data.riskDays} dias ou mais.`}
              action={data.atRisk.count > 0 ? <SectionLink href="/writer/analytics/readers?filter=risk">Ver {INT.format(data.atRisk.count)}</SectionLink> : undefined}
            />
          </div>
          {data.atRisk.readers.length === 0 ? (
            <div className="px-5 pb-5">
              <Empty>Nenhum assinante sumido. Seus assinantes estão por perto.</Empty>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--admin-line-soft)]">
              {data.atRisk.readers.map((person) => (
                <li key={person.id}>
                  <Link
                    href={`/writer/analytics/readers/${person.id}`}
                    className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-[#faf8f4]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[var(--liquid-ink)]">{person.name || person.email}</span>
                      <span className="block truncate text-xs text-[var(--liquid-muted)]">{person.email}</span>
                    </span>
                    <span className="shrink-0 text-right text-xs">
                      <span className="block font-medium text-[var(--admin-bad)]">{timeAgo(person.lastAccess)}</span>
                      <span className="block text-[var(--liquid-muted)]">{person.lifetime ? "vitalício" : "último acesso"}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </section>
  );
}

function Fact({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12.5px] font-medium text-[var(--liquid-muted)]">{label}</dt>
      <dd className="mt-1 text-xl font-semibold first-letter:uppercase leading-tight tracking-tight text-[var(--liquid-ink)]">{value}</dd>
      {children && <dd className="mt-0.5 text-xs text-[var(--liquid-muted)]">{children}</dd>}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg bg-[var(--admin-sunken)] px-4 py-6 text-center text-sm text-[var(--liquid-muted)]">{children}</p>;
}
