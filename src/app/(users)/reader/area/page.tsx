import Link from "next/link";
import { HeaderReader } from "./_components/HeaderReader";
import { FiChevronRight } from "react-icons/fi";
import { QuoteCard } from "./_components/devotional/quota/QuoteCard";
import { VerseCard } from "./_components/devotional/verse/VerseCard";
import { DevotionalCard } from "./_components/devotional/devotional/DevotionalCard";
import { PrayerCard } from "./_components/devotional/prayer/PrayerCard";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import clientPromise from "@/lib/mongodb";
import { startOfDay, addDays, subDays, format, parse } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { redirect } from "next/navigation";
import { WeekDayFilter } from "./_components/WeekDayFilter";
import { GlassCard } from "@/components/ui/glass-card";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TZ = "America/Sao_Paulo";

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

/**
 * Calcula o range do dia (gte / lt) timezone-safe
 */
function brasiliaDayRange(day: Date) {
  const start = startOfDay(day);
  const next = startOfDay(addDays(start, 1));
  return {
    gte: fromZonedTime(start, TZ),
    lt: fromZonedTime(next, TZ),
  };
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
  const dayRange = brasiliaDayRange(activeDay);

  // 🔹 Pega writerId do usuário logado (PostgreSQL)
  const userReader = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      writer: {
        select: {
          id: true,
          logoUrl: true,
          titleApp: true,
          titleHeader: true,
        },
      },
    },
  });

  const writerId = userReader?.writer?.id;
  if (!writerId) {
    return (
      <section className="p-8">
        <h1 className="text-xl font-bold mb-2">Sem escritor vinculado</h1>
        <p className="opacity-80">
          Vincule sua conta a um escritor para acessar esta área.
        </p>
      </section>
    );
  }

  // 🔹 Busca personalização no MongoDB
  const client = await clientPromise;
  const mongoDb = client.db(process.env.MONGODB_DB || "railway");
  const personalization = await mongoDb
    .collection("personalizations")
    .findOne({ writerId });

  // 🔹 Define cores com fallback padrão
  const colors = {
    primary: personalization?.primaryColor || "#202020",
    secondary: personalization?.secondaryColor || "#404040",
    background: personalization?.backgroundColor || "#ffffff",
    buttonBg: personalization?.bgButtonColor || "#22c55e",
    buttonText: personalization?.buttonTextColor || "#ffffff",
    text: personalization?.textColor || "#000000",
    independenteColor1: personalization?.independenteColor1 || "#f97316",
    independenteColor2: personalization?.independenteColor2 || "#f97316",
  };

  const items = [
    // { id: 5, name: "Cronologia Diários", type: "Daily", link: "/reader/area/daily" },
    // { id: 1, name: "Oração de Hoje", type: "Oração", link: "/reader/area/prayer" },
    { id: 2, name: "Plano Bíblia em 365 Dias", type: "Plano de Leitura", link: "/reader/area/reading/plan/365" },
    { id: 3, name: "Biblioteca", type: "Ebooks", link: "/reader/area/courses" },
    { id: 4, name: "Dashboard Bíblico", type: "Conquistas", link: "/reader/area/dashboard" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-36 transition-all sm:px-5">
      <HeaderReader
        colors={colors}
        titleHeader={userReader?.writer?.titleHeader || "Vamos passar tempo com Deus ?"}
      />

      <div className="flex w-full items-center justify-center">
        <WeekDayFilter colors={colors} />
      </div>

      <div className="text-[var(--liquid-ink)]">
        {activeDay.toLocaleDateString("pt-BR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        -{" "}
        {activeDay.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}

        <h2 className="mt-1 text-lg font-bold md:text-xl">
          {userReader?.writer?.titleApp || "Meu Devocional"}
        </h2>
      </div>

      <h3 className="my-2 mt-6 text-sm font-semibold tracking-wide text-[var(--liquid-muted)]">
        DEVOCIONAL DIÁRIO
      </h3>
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 py-1 sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0">
          <QuoteCard colors={colors} dayRange={dayRange} />
        </div>
        <div className="min-w-0">
          <VerseCard colors={colors} dayRange={dayRange} />
        </div>
        <div className="min-w-0">
          <DevotionalCard colors={colors} dayRange={dayRange} />
        </div>
        <div className="min-w-0">
          <PrayerCard colors={colors} dayRange={dayRange} />
        </div>
      </div>

      <h3 className="my-2 mt-5 text-sm font-semibold tracking-wide text-[var(--liquid-muted)]">
        FUNCIONALIDADES & OUTROS
      </h3>
      <div className="space-y-4 py-4">
        {items.map((item) => (
          <Link key={item.id} href={item.link} className="group block min-w-0">
            <GlassCard
              interactive
              padding="lg"
              className="flex w-full min-w-0 items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <h2 className="mb-2 truncate text-xl font-extrabold text-[var(--liquid-ink)] md:text-2xl">
                  {item.name}
                </h2>
                <p
                  style={{
                    color: colors.buttonText,
                    backgroundColor: colors.buttonBg,
                  }}
                  className="w-fit rounded-full px-3 py-1 text-xs font-semibold shadow"
                >
                  {item.type}
                </p>
              </div>
              <FiChevronRight
                size={36}
                className="shrink-0 text-[var(--liquid-muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--liquid-ink)]"
              />
            </GlassCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
