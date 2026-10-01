import { FaBook, FaFileExcel, FaQuoteLeft, FaDailymotion, FaPray } from "react-icons/fa";
import { FiBook } from "react-icons/fi";
import { WriterShell } from "@/components/ui/writer-shell";
import { PageHeader } from "@/components/ui/page-header";
import { NavTile } from "@/components/ui/nav-tile";

export default function DailyPage() {
    const itemsNav = [
        {
            id: 1,
            title: "Minha Citação (Hoje)",
            href: "/writer/daily/quote",
            icon: <FaQuoteLeft size={24} />,
        },
        {
            id: 2,
            title: "Meu Devocional (Hoje)",
            href: "/writer/daily/devotional",
            icon: <FiBook size={24} />,
        },
        {
            id: 3,
            title: "Minha passagem (Hoje)",
            href: "/writer/daily/verse",
            icon: <FaBook size={24} />,
        },
        {
            id: 4,
            title: "Minha oração (Hoje)",
            href: "/writer/daily/prayer",
            icon: <FaPray size={24} />,
        },
        {
            id: 5,
            title: "Postagem em massa",
            href: "/writer/imports",
            icon: <FaFileExcel size={24} />,
        },
        {
            id: 6,
            title: "Gerenciamento Diário",
            href: "/writer/daily/management",
            icon: <FaDailymotion size={24} />,
        },
    ];

    return (
        <WriterShell maxWidth="5xl">
            <PageHeader
                title="Painel Diário"
                description="Gerencie o conteúdo do seu diário de hoje."
                backHref="/writer/dashboard"
                centered
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
                {itemsNav.map((item, index) => (
                    <div
                        key={item.id}
                        className="animate-glass-in"
                        style={{ animationDelay: `${index * 40}ms` }}
                    >
                        <NavTile href={item.href} title={item.title} icon={item.icon} />
                    </div>
                ))}
            </div>
        </WriterShell>
    );
}
