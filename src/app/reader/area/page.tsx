import Link from "next/link";
import { HeaderReader } from "./_components/HeaderReader";
import { FiChevronRight } from "react-icons/fi";
import { MenuPainel } from "./_components/MenuPainel";

export default function AreaReader() {
  const items = [
    {
      id: 1,
      name: "Cursos Profundos",
      type: "Estudos Bíblicos",
      link: "/reader/area/courses",
      primaryColor: "from-blue-900 to-blue-500",
    },
    {
      id: 2,
      name: "Faça sua oração",
      type: "Oração",
      link: "/reader/area/prayer",
      primaryColor: "from-green-900 to-green-500",
    },
  ];

  return (
    <section className="container mx-auto max-w-lg">
      <HeaderReader />
      <div className="space-y-6 md:p-0 p-6 mt-36">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className={`flex items-center justify-between bg-gradient-to-r ${item.primaryColor} text-white p-5 rounded-2xl shadow-lg hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 group`}
          >
            <div>
              <h2 className="text-2xl font-extrabold mb-2">{item.name}</h2>
              <p className="bg-white/90 text-green-900 text-xs px-3 py-1 rounded-full w-fit font-semibold shadow">
                {item.type}
              </p>
            </div>
            <FiChevronRight size={40} className="text-white group-hover:translate-x-2 transition-transform duration-200" />
          </Link>
        ))}
      </div>
      <MenuPainel />
    </section>
  );
}