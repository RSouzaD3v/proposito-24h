import Link from "next/link";
import { HeaderReader } from "./_components/HeaderReader";
import { FiChevronRight } from "react-icons/fi";
import { MenuPainel } from "./_components/MenuPainel";
import { QuoteCard } from "./_components/devotional/quota/QuoteCard";
import { VerseCard } from "./_components/devotional/verse/VerseCard";
import { DevotionalCard } from "./_components/devotional/devotional/DevotionalCard";
import { PrayerCard } from "./_components/devotional/prayer/PrayerCard";
import { ThemeWriterProvider } from "./_contexts/ThemeWriterContext";
import { authOptions } from "@/lib/authOption";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import clientPromise from "@/lib/mongodb";
import { startOfDay, addDays } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { WeekDayFilter } from "./_components/WeekDayFilter";
import { TrackAccess } from "@/components/TrackAccess";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TZ = "America/Sao_Paulo";

/**
 * Resolve o dia ativo a partir da URL (?day=YYYY-MM-DD)
 * Fallback: hoje (timezone SP)
 */
function resolveActiveDay(searchDay?: string) {
  if (searchDay) {
    const parsed = new Date(`${searchDay}T00:00:00`);
    if (!isNaN(parsed.getTime())) {
      return toZonedTime(parsed, TZ);
    }
  }
  return toZonedTime(new Date(), TZ);
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

  // 🔹 Dia ativo (URL ou hoje)
  const activeDay = resolveActiveDay((await searchParams)?.day);
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
    { id: 5, name: "Cronologia Diários", type: "Daily", link: "/reader/area/daily" },
    { id: 1, name: "Oração de Hoje", type: "Oração", link: "/reader/area/prayer" },
    { id: 2, name: "Plano Bíblia em 365 Dias", type: "Plano de Leitura", link: "/reader/area/reading/plan/365" },
    { id: 3, name: "Biblioteca", type: "Ebooks", link: "/reader/area/courses" },
    { id: 4, name: "Dashboard Bíblico", type: "Conquistas", link: "/reader/area/dashboard" },
  ];

  return (
    <ThemeWriterProvider>
      <TrackAccess />
      <section className="container mx-auto min-h-screen md:px-1 px-5 py-36 transition-all">
        <HeaderReader
          colors={colors}
          titleHeader={userReader?.writer?.titleHeader || "Vamos passar tempo com Deus ?"}
        />

        <div className="flex items-center justify-center">
          <WeekDayFilter colors={colors} />
        </div>

        {/* 📅 Data baseada no filtro */}
        <div className="px-2 md:text-xl text-sm mt-5">
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

          <h2 className="md:text-xl text-lg font-bold mt-1">
            {userReader?.writer?.titleApp || "Meu Devocional"}
          </h2>
        </div>

        {/* 📖 Cards principais (ainda sem receber o dayRange) */}
        <h3 className="mt-6 mb-2 px-2 my-2">DEVOCIONAL DIÁRIO</h3>
        <div className="grid md:grid-cols-4 grid-cols-1 gap-6 px-2 py-1">
          <QuoteCard colors={colors} dayRange={dayRange} />
          <VerseCard colors={colors}  dayRange={dayRange}/>
          <DevotionalCard colors={colors} dayRange={dayRange}/>
          <PrayerCard colors={colors} dayRange={dayRange}/>
        </div>

        {/* ⚙️ Funcionalidades */}
        <h3 className="mt-5 px-2 my-2">FUNCIONALIDADES & OUTROS</h3>
        <div className="space-y-6 md:p-0 py-6 px-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              style={{ backgroundColor: colors.background, color: colors.text }}
              className="flex items-center justify-between p-5 rounded-2xl shadow-lg hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 group"
            >
              <div>
                <h2 className="md:text-2xl text-xl font-extrabold mb-2">
                  {item.name}
                </h2>
                <p
                  style={{ color: colors.buttonText, backgroundColor: colors.buttonBg }}
                  className="text-xs px-3 py-1 rounded-full w-fit font-semibold shadow"
                >
                  {item.type}
                </p>
              </div>
              <FiChevronRight
                size={40}
                className="text-white group-hover:translate-x-2 transition-transform duration-200"
              />
            </Link>
          ))}
        </div>

        <MenuPainel colors={colors} />
      </section>
    </ThemeWriterProvider>
  );
}
