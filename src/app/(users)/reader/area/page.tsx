import { apiFetch } from "@/lib/api/server";
import type { ReaderHome } from "@/lib/api/types";
import Link from "next/link";
import { HeaderReader } from "./_components/HeaderReader";
import { BarChart3, BookMarked, CalendarDays, NotebookPen } from "lucide-react";
import { buildSteps, DailyJourney } from "./_components/DailyJourney";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import { startOfDay, addDays, subDays, format, parse } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { redirect } from "next/navigation";
import { WeekDayFilter } from "./_components/WeekDayFilter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TZ = "America/Sao_Paulo";

const EXPLORE = [
  { name: "Caderno de Oração", type: "Seus pedidos", link: "/reader/area/prayer-journal", scene: "reader-scene-dusk", icon: NotebookPen },
  { name: "Bíblia em 365 Dias", type: "Plano de leitura", link: "/reader/area/reading/plan/365", scene: "reader-scene-olive", icon: CalendarDays },
  { name: "Biblioteca", type: "Ebooks", link: "/reader/area/courses", scene: "reader-scene-night", icon: BookMarked },
  { name: "Dashboard Bíblico", type: "Conquistas", link: "/reader/area/dashboard", scene: "reader-scene-dawn", icon: BarChart3 },
];

function formatDayParamSp(date: Date) {
  return format(toZonedTime(date, TZ), "yyyy-MM-dd");
}

function parseDayParamInSp(dayParam: string) {
  const parsed = parse(dayParam, "yyyy-MM-dd", new Date());
  return toZonedTime(fromZonedTime(parsed, TZ), TZ);
}

/** Ontem ou hoje (America/Sao_Paulo); usado para validar ?day= */
function isYesterdayOrTodaySp(dayParam: string) {
  const now = toZonedTime(new Date(), TZ);
  const todayStart = startOfDay(now);
  const yesterdayStart = subDays(todayStart, 1);
  const targetStart = startOfDay(parseDayParamInSp(dayParam));
  return (
    targetStart.getTime() <= todayStart.getTime() &&
    targetStart.getTime() >= yesterdayStart.getTime()
  );
}

export default async function AreaReader({
  searchParams,
}: {
  searchParams?: Promise<{ day?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div className="p-8 text-center">Acesso negado</div>;
  }

  // 🔹 Dia ativo (URL ou hoje) — só ontem ou hoje
  const sp = await searchParams;
  const requestedDay = sp?.day;
  const nowSp = toZonedTime(new Date(), TZ);

  if (requestedDay && !isYesterdayOrTodaySp(requestedDay)) {
    redirect(`/reader/area?day=${formatDayParamSp(nowSp)}`);
  }

  const activeDay = requestedDay ? parseDayParamInSp(requestedDay) : nowSp;

  const home = await apiFetch<ReaderHome>(
    `/reader/home${requestedDay ? `?day=${encodeURIComponent(requestedDay)}` : ""}`,
  );
  if (!home.ok || !home.data.writer) {
    return (
      <section className="p-8">
        <h1 className="text-xl font-bold mb-2">Sem escritor vinculado</h1>
        <p className="opacity-80">
          Vincule sua conta a um escritor para acessar esta área.
        </p>
      </section>
    );
  }
  const { writer } = home.data;
  const steps = buildSteps(home.data);
  const available = steps.filter((step) => step.item);
  const next = available.find((step) => !step.item!.completed);
  const hour = nowSp.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const dateLabel = activeDay.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const heroImage = home.data.devotional?.imageUrl ?? steps.find((step) => step.item?.imageUrl)?.item?.imageUrl;

  return (
    <>
      <HeaderReader
        titleHeader={writer.titleHeader}
        writerName={writer.titleApp || writer.name}
        greeting={greeting}
        dateLabel={dateLabel}
        imageUrl={heroImage}
        next={next ? { href: next.href, label: `Começar: ${next.label}` } : null}
        finished={available.length > 0 && !next}
      />

      <div className="mx-auto w-full max-w-3xl space-y-9 px-5 pt-6">
        <WeekDayFilter />
        <DailyJourney steps={steps} />

        <section aria-labelledby="explore">
          <p className="reader-eyebrow">Continue crescendo</p>
          <h2 id="explore" className="mb-4 mt-1 text-2xl">Explore</h2>
          <div className="grid grid-cols-2 gap-3">
            {EXPLORE.map(({ name, type, link, scene, icon: Icon }) => (
              <Link
                key={link}
                href={link}
                className={`reader-scene ${scene} flex h-40 flex-col justify-between rounded-3xl p-4 transition-transform motion-safe:hover:-translate-y-0.5`}
              >
                <Icon className="size-6" />
                <span>
                  <span className="block text-xs font-medium text-white/80">{type}</span>
                  <span className="reader-serif mt-0.5 block text-lg leading-tight">{name}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
