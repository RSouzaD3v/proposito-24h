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
import { WeekDayFilter } from "./_components/WeekDayFilter";
import { TrackAccess } from "@/components/TrackAccess";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Calcula o Dia do Grouping (1,2,3...)
 * Baseado no startAt do usuário
 */
function resolveGroupingDayIndex(startAt?: Date | null) {
  if (!startAt) return 1;

  const start = new Date(startAt);
  const today = new Date();

  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays =
    Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  return diffDays < 1 ? 1 : diffDays;
}

export default async function AreaReader() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div className="p-8 text-center">Acesso negado</div>;
  }

  // 🔹 Usuário + Writer
  const userReader = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
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

  // 🔹 Grouping ativo do usuário
  const userGrouping = await db.userGroupingDaily.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
    select: {
      startAt: true,
      groupingDailyId: true,
    },
  });

  // 🔹 Dia atual do plano (Dia 1, 2, 3...)
  const activeDayIndex = resolveGroupingDayIndex(userGrouping?.startAt);

  // 🔹 Personalização (MongoDB)
  const client = await clientPromise;
  const mongoDb = client.db(process.env.MONGODB_DB || "railway");
  const personalization = await mongoDb
    .collection("personalizations")
    .findOne({ writerId });

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
    { id: 1, name: "Trajetórias", type: "Daily", link: "/reader/area/group-daily" },
    { id: 2, name: "Cronologia Diários", type: "Daily", link: "/reader/area/daily" },
    { id: 3, name: "Plano Bíblia em 365 Dias", type: "Plano de Leitura", link: "/reader/area/reading/plan/365" },
    { id: 4, name: "Biblioteca", type: "Ebooks", link: "/reader/area/courses" },
    { id: 5, name: "Dashboard Bíblico", type: "Conquistas", link: "/reader/area/dashboard" },
  ];

  return (
    <ThemeWriterProvider>
      <TrackAccess />

      <section className="container mx-auto min-h-screen md:px-1 px-5 py-36 transition-all">
        <HeaderReader
          colors={colors}
          titleHeader={
            userReader?.writer?.titleHeader ||
            "Vamos passar tempo com Deus ?"
          }
        />

        {/* 📅 Filtro semanal ajustado ao Grouping */}
        <div className="flex items-center justify-center">
          <WeekDayFilter
            colors={colors}
            startAt={userGrouping?.startAt ?? null}
            currentDayIndex={activeDayIndex}
          />
        </div>

        {/* 🔸 Cabeçalho */}
        <div className="px-2 md:text-xl text-sm mt-5">
          <h2 className="md:text-xl text-lg font-bold mt-1">
            {userReader?.writer?.titleApp || "Meu Devocional"}
          </h2>

          <p className="opacity-70 text-sm mt-1">
            Dia {activeDayIndex} do plano
          </p>
        </div>

        {/* 📖 DEVOCIONAL DIÁRIO */}
        <h3 className="mt-6 mb-2 px-2 my-2">DEVOCIONAL DIÁRIO</h3>
        <div className="grid md:grid-cols-4 grid-cols-1 gap-6 px-2 py-1">
          <QuoteCard
            colors={colors}
            dayIndex={activeDayIndex}
            groupingDailyId={userGrouping?.groupingDailyId}
          />

          <VerseCard
            colors={colors}
            dayIndex={activeDayIndex}
            groupingDailyId={userGrouping?.groupingDailyId}
          />

          <DevotionalCard
            colors={colors}
            dayIndex={activeDayIndex}
            groupingDailyId={userGrouping?.groupingDailyId}
          />

          <PrayerCard
            colors={colors}
            dayIndex={activeDayIndex}
            groupingDailyId={userGrouping?.groupingDailyId}
          />
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
                  style={{
                    color: colors.buttonText,
                    backgroundColor: colors.buttonBg,
                  }}
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
