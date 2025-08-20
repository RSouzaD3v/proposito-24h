import { FaBook, FaFileExcel, FaQuoteLeft, FaDailymotion } from "react-icons/fa";
import Link from "next/link";
import { FiArrowLeft, FiBook } from "react-icons/fi";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function DailyPage() {
    const itemsNav = [
        {
            id: 1,
            title: "Minha Citação (Hoje)",
            href: "/writer/daily/quote",
            icon: <FaQuoteLeft size={32} />
        },
        {
            id: 2,
            title: "Meu Devocional (Hoje)",
            href: "/writer/daily/devotional",
            icon: <FiBook size={32} />
        },
        {
            id: 3,
            title: "Minha passagem (Hoje)",
            href: "/writer/daily/verse",
            icon: <FaBook size={32} />
        },
        {
            id: 4,
            title: "Postagem em massa",
            href: "/writer/imports",
            icon: <FaFileExcel size={32} />
        },
        {
            id: 5,
            title: "Gerenciamento Daily",
            href: "/writer/daily/management",
            icon: <FaDailymotion size={32} />
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-5">
            <Link href="/writer/dashboard" className="mb-8 flex items-center gap-2 absolute top-5 left-5 text-indigo-700 font-bold text-lg">
                <FiArrowLeft size={24}/>
                Voltar
            </Link>
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Daily Page</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
                {itemsNav.map(item => (
                    <Link key={item.id} href={item.href} className="group">
                        <Card className="cursor-pointer transition-transform group-hover:-translate-y-1 group-hover:shadow-2xl flex flex-col items-center">
                            <CardContent className="flex flex-col items-center p-6">
                                <div className="mb-4 text-indigo-600">{item.icon}</div>
                                <CardTitle className="text-lg font-semibold text-gray-700 text-center">
                                    {item.title}
                                </CardTitle>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}