import Link from "next/link";
import { apiGet } from "@/lib/api/server";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { requireAdmin } from "../_lib/auth";
import { deltaOf, formatDate, INT, PCT, rangeOf } from "../_lib/format";
import { CHART, heatColor } from "../_lib/palette";
import { Delta, KpiStrip, PageHeader, RangeTabs, SectionLink, SectionTitle } from "../_components/StatTile";
import { timeAgo } from "../_components/ActivityFeed";
import { DailyActivityChart, type DailyRow } from "./_charts/DailyActivityChart";
import { ActivityHeatmap } from "./_charts/ActivityHeatmap";

export const metadata = { title: "Engajamento · Admin" };

type Pair = { current: number; previous: number; users?: number };

type Engagement = {
  start: string;
  end: string;
  audience: {
    totalReaders: number;
    dau: number;
    wau: number;
    mau: number;
    neverReturned: number;
    deletedInPeriod: number;
    signups: Pair;
    engagedUsers: number;
  };
  daily: DailyRow[];
  heatmap: { dow: number; hour: number; events: number }[];
  actions: Record<"devotional" | "quote" | "verse" | "highlight" | "journal" | "quiz" | "plan" | "game" | "app", Pair> & {
    booksStarted: Pair;
    booksCompleted: Pair;
  };
  topBooks: {
    id: string;
    title: string;
    writer_name: string;
    chapters: number;
    readers: number;
    completed: number;
    active: number;
    avg_progress: number;
  }[];
  quizzes: { id: string; title: string; questions: number; sessions: number; completed: number; avg_score: number }[];
  app: {
    users: number;
    platforms: { platform: string; users: number; logins: number }[];
    push: { platform: string; devices: number; daily: number; prayer: number; new_content: number }[];
  };
  cohorts: { month: string; signups: number; active_30d: number; ever_returned: number; subscribed: number }[];
  atRisk: {
    count: number;
    readers: { id: string; name: string | null; email: string; lastAccess: string | null; createdAt: string; writer: { id: string; name: string } | null }[];
  };
};

const ACTIONS: { key: keyof Engagement["actions"]; label: string; note: string }[] = [
  { key: "app", label: "Aberturas do app", note: "sessões renovadas no celular" },
  { key: "devotional", label: "Devocionais concluídos", note: "marcados como lidos" },
  { key: "verse", label: "Versículos do dia", note: "marcados como lidos" },
  { key: "quote", label: "Frases do dia", note: "marcadas como lidas" },
  { key: "highlight", label: "Destaques na Bíblia", note: "versículos marcados" },
  { key: "plan", label: "Dias do plano bíblico", note: "dias concluídos" },
  { key: "journal", label: "Pedidos de oração", note: "anotados no diário" },
  { key: "booksStarted", label: "Livros iniciados", note: "primeira abertura" },
  { key: "booksCompleted", label: "Livros concluídos", note: "até o último capítulo" },
  { key: "quiz", label: "Quizzes jogados", note: "sessões iniciadas" },
  { key: "game", label: "Níveis do game", note: "níveis jogados" },
];

const PLATFORM: Record<string, string> = { ios: "iPhone", android: "Android", desconhecido: "Não informado", app: "App" };
const MONTH = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit", timeZone: "UTC" });

export default async function EngagementPage({ searchParams }: { searchParams?: Promise<{ range?: string }> }) {
  await requireAdmin();
  const range = rangeOf((await searchParams)?.range);
  const data = await apiGet<Engagement>(`/admin/engagement?range=${range.key}`);
  const { audience, actions, app } = data;

  const stickiness = audience.mau ? audience.dau / audience.mau : 0;
  const actionMax = Math.max(1, ...ACTIONS.map(({ key }) => actions[key].current));
  const pushTotal = app.push.reduce((sum, row) => sum + row.devices, 0);
  const pushDaily = app.push.reduce((sum, row) => sum + row.daily, 0);
  const pushPrayer = app.push.reduce((sum, row) => sum + row.prayer, 0);
  const pushNew = app.push.reduce((sum, row) => sum + row.new_content, 0);
  const platformTotal = app.platforms.reduce((sum, row) => sum + row.users, 0);
  const loginsTotal = app.platforms.reduce((sum, row) => sum + row.logins, 0);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Painel"
        title="Engajamento"
        description={`O que os leitores fazem no app · ${formatDate(data.start)} — ${formatDate(data.end)}`}
        actions={<RangeTabs current={range.key} />}
      />

      <KpiStrip
        items={[
          { label: "Ativos hoje", value: INT.format(audience.dau), hint: "últimas 24h" },
          { label: "Ativos na semana", value: INT.format(audience.wau), hint: "últimos 7 dias" },
          {
            label: "Ativos no mês",
            value: INT.format(audience.mau),
            hint: `${PCT.format(audience.totalReaders ? audience.mau / audience.totalReaders : 0)} da base`,
          },
          { label: "Fidelidade (DAU/MAU)", value: PCT.format(stickiness), hint: stickiness >= 0.2 ? "hábito forte" : "abaixo de 20%" },
          {
            label: "Leitores engajados",
            value: INT.format(audience.engagedUsers),
            hint: "fizeram algo no período",
          },
        ]}
      />

      <GlassCard>
        <SectionTitle title="Atividade diária" description="Leitores únicos com alguma ação por dia, ações totais e cadastros" />
        <DailyActivityChart data={data.daily} />
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <GlassCard className="lg:col-span-3">
          <SectionTitle title="Quando os leitores usam o app" description="Ações por dia da semana e hora" />
          <ActivityHeatmap cells={data.heatmap} />
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <SectionTitle title="Base de leitores" description="Situação atual" action={<SectionLink href="/admin/readers">Ver leitores</SectionLink>} />
          <dl className="divide-y divide-[var(--admin-line-soft)] text-[13.5px]">
            <Row label="Leitores cadastrados" value={INT.format(audience.totalReaders)} />
            <Row
              label="Cadastros no período"
              value={INT.format(audience.signups.current)}
              extra={<Delta value={deltaOf(audience.signups.current, audience.signups.previous)} />}
            />
            <Row
              label="Nunca voltaram ao app"
              value={INT.format(audience.neverReturned)}
              hint={PCT.format(audience.totalReaders ? audience.neverReturned / audience.totalReaders : 0)}
              href="/admin/readers?filter=never"
            />
            <Row
              label="Inativos há 30+ dias"
              value={INT.format(Math.max(audience.totalReaders - audience.mau - audience.neverReturned, 0))}
              href="/admin/readers?filter=inactive"
            />
            <Row label="Contas excluídas no período" value={INT.format(audience.deletedInPeriod)} href="/admin/readers?filter=deleted" />
          </dl>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard>
          <SectionTitle title="O que os leitores fazem" description="Total de ações no período, com leitores únicos e variação" />
          <ul className="grid gap-3">
            {ACTIONS.map(({ key, label, note }) => {
              const pair = actions[key];
              return (
                <li key={key}>
                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="min-w-0 truncate">
                      <span className="font-medium text-[var(--liquid-ink)]">{label}</span>
                      <span className="ml-1.5 text-xs text-[var(--liquid-muted)]">
                        {typeof pair.users === "number" && pair.users > 0 ? `${INT.format(pair.users)} leitores` : note}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-baseline gap-2">
                      <span className="font-medium tabular-nums text-[var(--liquid-ink)]">{INT.format(pair.current)}</span>
                      <span className="w-12 text-right">
                        <Delta value={deltaOf(pair.current, pair.previous)} />
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-[var(--admin-sunken)]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(pair.current / actionMax) * 100}%`, background: CHART.primary }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassCard>

        <div className="grid gap-4">
          <GlassCard>
            <SectionTitle title="App no celular" description="Leitores com sessão ativa no app e logins no período" />
            <div className="mb-4 flex items-baseline gap-6">
              <div>
                <p className="text-[1.65rem] font-semibold leading-none tabular-nums tracking-tight">{INT.format(app.users)}</p>
                <p className="mt-1.5 text-xs text-[var(--liquid-muted)]">
                  leitores com o app conectado · {PCT.format(audience.totalReaders ? app.users / audience.totalReaders : 0)} da base
                </p>
              </div>
              <div>
                <p className="text-[1.65rem] font-semibold leading-none tabular-nums tracking-tight">{INT.format(loginsTotal)}</p>
                <p className="mt-1.5 text-xs text-[var(--liquid-muted)]">novos logins no período</p>
              </div>
            </div>
            {platformTotal > 0 ? (
              <>
                <div className="flex h-2 gap-[2px] overflow-hidden rounded-full" aria-hidden>
                  {app.platforms
                    .filter((row) => row.users > 0)
                    .map((row, index) => (
                      <div key={row.platform} style={{ width: `${(row.users / platformTotal) * 100}%`, background: index === 0 ? CHART.primary : index === 1 ? "#2a6fa0" : CHART.neutral }} />
                    ))}
                </div>
                <ul className="mt-3 grid gap-1.5 text-[13px]">
                  {app.platforms
                    .filter((row) => row.users > 0 || row.logins > 0)
                    .map((row, index) => (
                      <li key={row.platform} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-[2px]"
                            style={{ background: index === 0 ? CHART.primary : index === 1 ? "#2a6fa0" : CHART.neutral }}
                            aria-hidden
                          />
                          {PLATFORM[row.platform] ?? row.platform}
                        </span>
                        <span className="tabular-nums text-[var(--liquid-muted)]">
                          <span className="font-medium text-[var(--liquid-ink)]">{INT.format(row.users)}</span> conectados ·{" "}
                          {INT.format(row.logins)} logins
                        </span>
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-[var(--liquid-muted)]">Nenhum leitor conectado pelo app ainda.</p>
            )}
          </GlassCard>

          <GlassCard>
            <SectionTitle title="Notificações" description={`${INT.format(pushTotal)} aparelhos registrados para push`} />
            <div className="grid grid-cols-3 gap-4">
              <OptIn label="Lembrete diário" value={pushDaily} total={pushTotal} />
              <OptIn label="Lembrete de oração" value={pushPrayer} total={pushTotal} />
              <OptIn label="Conteúdo novo" value={pushNew} total={pushTotal} />
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard>
        <SectionTitle
          title="Retenção por mês de cadastro"
          description="De quem se cadastrou em cada mês: quantos voltaram depois do primeiro dia, quantos seguem ativos e quantos assinam"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead>
              <tr className="border-b border-[var(--admin-line)] text-left text-xs text-[var(--liquid-muted)]">
                <th className="py-2 pr-3 font-medium">Mês</th>
                <th className="px-3 py-2 text-right font-medium">Cadastros</th>
                <th className="px-3 py-2 text-right font-medium">Voltaram</th>
                <th className="px-3 py-2 text-right font-medium">Ativos (30d)</th>
                <th className="py-2 pl-3 text-right font-medium">Assinantes</th>
              </tr>
            </thead>
            <tbody>
              {data.cohorts.map((cohort) => (
                <tr key={cohort.month} className="border-b border-[var(--admin-line-soft)] last:border-0">
                  <td className="py-2 pr-3 capitalize text-[var(--liquid-ink)]">{MONTH.format(new Date(cohort.month))}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">{INT.format(cohort.signups)}</td>
                  <CohortCell value={cohort.ever_returned} base={cohort.signups} />
                  <CohortCell value={cohort.active_30d} base={cohort.signups} />
                  <CohortCell value={cohort.subscribed} base={cohort.signups} last />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <GlassCard className="lg:col-span-3">
          <SectionTitle title="Livros mais lidos" description="Leitores que abriram, ativos no período e quem chegou ao fim" />
          {data.topBooks.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--liquid-muted)]">Nenhuma leitura de livro registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--admin-line)] text-left text-xs text-[var(--liquid-muted)]">
                    <th className="py-2 pr-3 font-medium">Livro</th>
                    <th className="px-3 py-2 text-right font-medium">Leitores</th>
                    <th className="px-3 py-2 text-right font-medium">Ativos</th>
                    <th className="py-2 pl-3 font-medium">Conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topBooks.map((book) => {
                    const completion = book.readers ? book.completed / book.readers : 0;
                    return (
                      <tr key={book.id} className="border-b border-[var(--admin-line-soft)] last:border-0">
                        <td className="max-w-[240px] py-2.5 pr-3">
                          <p className="truncate font-medium text-[var(--liquid-ink)]">{book.title}</p>
                          <p className="truncate text-xs text-[var(--liquid-muted)]">
                            {book.writer_name}
                            {book.chapters > 0 && ` · em média até o cap. ${Math.round(book.avg_progress)} de ${book.chapters}`}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{INT.format(book.readers)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{INT.format(book.active)}</td>
                        <td className="py-2.5 pl-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-16 rounded-full bg-[var(--admin-sunken)]">
                              <div className="h-full rounded-full" style={{ width: `${completion * 100}%`, background: CHART.good }} />
                            </div>
                            <span className="tabular-nums text-[var(--liquid-muted)]">{PCT.format(completion)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <SectionTitle title="Quizzes" description="Sessões no período" action={<SectionLink href="/admin/quiz">Gerenciar</SectionLink>} />
          {data.quizzes.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--liquid-muted)]">Nenhum quiz cadastrado.</p>
          ) : (
            <ul className="divide-y divide-[var(--admin-line-soft)] text-[13px]">
              {data.quizzes.map((quiz) => (
                <li key={quiz.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/quiz/${quiz.id}`} className="min-w-0 hover:underline hover:underline-offset-4">
                    <p className="truncate font-medium text-[var(--liquid-ink)]">{quiz.title}</p>
                    <p className="text-xs text-[var(--liquid-muted)]">
                      {quiz.sessions ? `${PCT.format(quiz.completed / quiz.sessions)} terminam` : "sem sessões"}
                      {quiz.completed > 0 && ` · média ${INT.format(Math.round(quiz.avg_score))} pts`}
                    </p>
                  </Link>
                  <span className="shrink-0 font-medium tabular-nums">{INT.format(quiz.sessions)}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <SectionTitle
          title="Assinantes em risco"
          description={`${INT.format(data.atRisk.count)} ${data.atRisk.count === 1 ? "assinante não abre" : "assinantes não abrem"} o app há mais de 14 dias — candidatos a cancelar`}
          action={<SectionLink href="/admin/readers?filter=subscribers">Todos os assinantes</SectionLink>}
        />
        {data.atRisk.readers.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--liquid-muted)]">Todos os assinantes usaram o app nas últimas duas semanas.</p>
        ) : (
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {data.atRisk.readers.map((reader) => (
              <li key={reader.id} className="flex items-center justify-between gap-3 border-b border-[var(--admin-line-soft)] py-2.5 text-[13px]">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-[var(--liquid-ink)]">{reader.name || reader.email}</span>
                  <span className="block truncate text-xs text-[var(--liquid-muted)]">
                    {reader.email}
                    {reader.writer && ` · ${reader.writer.name}`}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-[var(--admin-warn)]">
                  {reader.lastAccess ? `visto ${timeAgo(reader.lastAccess)}` : "nunca abriu"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </section>
  );
}

function Row({
  label,
  value,
  hint,
  extra,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  extra?: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <dt className="text-[var(--liquid-muted)]">{label}</dt>
      <dd className="flex items-baseline gap-2">
        {extra}
        {hint && <span className="text-xs text-[var(--liquid-muted)]">{hint}</span>}
        <span className="font-medium tabular-nums text-[var(--liquid-ink)]">{value}</span>
      </dd>
    </>
  );
  return href ? (
    <Link href={href} className="-mx-2 flex items-baseline justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-[#faf8f4]">
      {inner}
    </Link>
  ) : (
    <div className="flex items-baseline justify-between gap-3 py-2.5">{inner}</div>
  );
}

function OptIn({ label, value, total }: { label: string; value: number; total: number }) {
  const share = total ? value / total : 0;
  return (
    <div>
      <p className="text-xl font-semibold tabular-nums tracking-tight">{PCT.format(share)}</p>
      <div className="mt-1.5 h-1 rounded-full bg-[var(--admin-sunken)]">
        <div className="h-full rounded-full" style={{ width: `${share * 100}%`, background: CHART.primary }} />
      </div>
      <p className="mt-1.5 text-xs text-[var(--liquid-muted)]">
        {label} · {INT.format(value)}
      </p>
    </div>
  );
}

function CohortCell({ value, base, last }: { value: number; base: number; last?: boolean }) {
  const share = base ? value / base : 0;
  return (
    <td className={cn("py-1.5 text-right", last ? "pl-3" : "px-3")}>
      <span
        className={cn("inline-block min-w-16 rounded px-2 py-1 tabular-nums", share >= 0.63 ? "text-white" : "text-[var(--liquid-ink)]")}
        style={{ background: base ? heatColor(share, 1) : "transparent" }}
        title={`${INT.format(value)} de ${INT.format(base)}`}
      >
        {base ? PCT.format(share) : "—"}
      </span>
    </td>
  );
}
