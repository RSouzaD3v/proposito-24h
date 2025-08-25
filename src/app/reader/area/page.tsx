import Link from "next/link";
import { HeaderReader } from "./_components/HeaderReader";
import { FiActivity, FiBook, FiChevronRight } from "react-icons/fi";
import { MenuPainel } from "./_components/MenuPainel";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FaCheck, FaComments } from "react-icons/fa";
import { QuoteCard } from "./_components/devotional/quota/QuoteCard";
import { VerseCard } from "./_components/devotional/verse/VerseCard";
import { DevotionalCard } from "./_components/devotional/devotional/DevotionalCard";
import { ThemeWriterProvider } from "./_contexts/ThemeWriterContext";

export default function AreaReader() {
  const date = new Date();

  const items = [
    {
      id: 1,
      name: "Biblioteca",
      type: "Ebooks",
      link: "/reader/area/courses",
      primaryColor: "from-[#202020] to-[#404040]",
    },
    {
      id: 2,
      name: "Oração de Hoje",
      type: "Oração",
      link: "/reader/area/prayer",
      primaryColor: "from-[#202020] to-[#404040]",
    }
  ];

  return (
    <ThemeWriterProvider>
      <section className="container mx-auto min-h-screen md:px-1 px-5 ">
        <HeaderReader />
        <div className="pt-32 px-2">
          {date.toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}

          <h2 className="md:text-xl text-lg font-bold">Deus seja sempre louvado! 🙌</h2>
        </div>

        <h3 className="mt-5 mb-2 px-2 my-2">DEVOCIONAL DIÁRIO</h3>
        <div className="grid md:grid-cols-3 grid-cols-1 gap-6 px-2 py-1">
          <QuoteCard />
          <VerseCard />
          <DevotionalCard />
        </div>

        <h3 className="mt-5 px-2 my-2">FUNCIONALIDADES & OUTROS</h3>
        <div className="space-y-6 md:p-0 py-6 px-2 mb-36">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className={`flex items-center justify-between bg-gradient-to-r ${item.primaryColor} text-white p-5 rounded-2xl shadow-lg hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 group`}
            >
              <div>
                <h2 className="md:text-2xl text-xl font-extrabold mb-2">{item.name}</h2>
                <p className="bg-white/10 text-propositoBlue text-xs px-3 py-1 rounded-full w-fit font-semibold shadow">
                  {item.type}
                </p>
              </div>
              <FiChevronRight size={40} className="text-white group-hover:translate-x-2 transition-transform duration-200" />
            </Link>
          ))}
        </div>
        <MenuPainel />
      </section>
    </ThemeWriterProvider>
  );
}