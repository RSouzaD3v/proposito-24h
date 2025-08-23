"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTree } from "react-icons/fa";
import { FiHeart, FiBook, FiSettings, FiCheck } from "react-icons/fi";

export const MenuPainel = () => {
    const pathname = usePathname();

    const itemsNav = [
        {
            id: 1,
            name: "Hoje",
            icon: <FiCheck size={22} />,
            link: "/reader/area"
        },
        {
            id: 2,
            name: "Oração",
            icon: <FiHeart size={22} />,
            link: "/reader/area/prayer"
        },
        {
            id: 3,
            name: "Bíblia",
            icon: <FiBook size={22} />,
            link: "/reader/area/bible"
        },
        {
            id: 4,
            name: "Minha Jornada",
            icon: <FaTree size={22} />,
            link: "/reader/area/journey"
        },
    ];

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 shadow-2xl rounded-full px-6 py-3 z-50 border border-gray-200 backdrop-blur-md">
            <ul className="flex items-center gap-6">
                {itemsNav.map(item => {
                    const isActive = pathname === item.link;
                    return (
                        <Link
                            key={item.id}
                            href={item.link}
                            className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-150
                                ${isActive
                                    ? "bg-gradient-to-b from-amber-600 to-amber-400 text-white shadow-lg scale-110"
                                    : "text-gray-700 hover:bg-gray-100 hover:scale-105"
                                }`}
                        >
                            <span className="mb-1">{item.icon}</span>
                            <span className="text-xs font-semibold">{item.name}</span>
                        </Link>
                    );
                })}
            </ul>
        </nav>
    );
};