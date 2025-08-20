import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Devotional, Quote, Verse } from "@prisma/client";
import Link from "next/link";

interface SectionsDailyTypes {
    quotes: Quote[];
    verses: Verse[];
    devotionals: Devotional[];
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
}

export const SectionsDaily = ({ quotes, verses, devotionals }: SectionsDailyTypes) => {
    type TabData<T> = {
        value: string;
        label: string;
        items: T[];
        render: (item: T) => React.ReactNode;
    };

    const tabData: [TabData<Quote>, TabData<Verse>, TabData<Devotional>] = [
        {
            value: "quotes",
            label: "Citações",
            items: quotes,
            render: (item: Quote) => (
                <div>
                    <span className="font-semibold">{item.nameAuthor}</span>
                    <p className="text-gray-700">{truncate(item.content, 50)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Data de exibição: {formatDate(item.createdAt)}
                    </p>
                    <div className="mt-5">
                        <Link className="bg-blue-500 text-white font-bold hover:bg-blue-700 p-1 px-3 rounded-sm" href={`/writer/daily/quote/edit/${item.id}`}>
                            Editar
                        </Link>
                    </div>
                </div>
            ),
        },
        {
            value: "verses",
            label: "Versículos",
            items: verses,
            render: (item: Verse) => (
                <div>
                    <span className="font-semibold">{item.reference}</span>
                    <p className="text-gray-700">{item.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Data de exibição: {formatDate(item.createdAt)}
                    </p>
                    <div className="mt-5">
                        <Link className="bg-blue-500 text-white font-bold hover:bg-blue-700 p-1 px-3 rounded-sm" href={`/writer/daily/verse/edit/${item.id}`}>
                            Editar
                        </Link>
                    </div>
                </div>
            ),
        },
        {
            value: "devotionals",
            label: "Devocionais",
            items: devotionals,
            render: (item: Devotional) => (
                <div>
                    <span className="font-semibold">{item.title}</span>
                    <p className="text-gray-700">{item.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Data de exibição: {formatDate(item.createdAt)}
                    </p>
                    <div className="mt-5">
                        <Link className="bg-blue-500 text-white font-bold hover:bg-blue-700 p-1 px-3 rounded-sm" href={`/writer/daily/devotional/edit/${item.id}`}>
                            Editar
                        </Link>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <Tabs defaultValue="quotes" className="w-full">
            <TabsList className="bg-gray-100 rounded-lg p-1 mb-4 flex gap-2">
                {tabData.map(tab => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="px-4 py-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white transition"
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabData.map((tab, idx) => {
                if (idx === 0) {
                    const quoteTab = tab as TabData<Quote>;
                    return (
                        <TabsContent key={quoteTab.value} value={quoteTab.value}>
                            <ul className="space-y-4">
                                {quoteTab.items.map((item) => (
                                    <li
                                        className="bg-white rounded-lg shadow p-4 border border-gray-200"
                                        key={item.id}
                                    >
                                        {quoteTab.render(item)}
                                    </li>
                                ))}
                            </ul>
                        </TabsContent>
                    );
                }
                if (idx === 1) {
                    const verseTab = tab as TabData<Verse>;
                    return (
                        <TabsContent key={verseTab.value} value={verseTab.value}>
                            <ul className="space-y-4">
                                {verseTab.items.map((item) => (
                                    <li
                                        className="bg-white rounded-lg shadow p-4 border border-gray-200"
                                        key={item.id}
                                    >
                                        {verseTab.render(item)}
                                    </li>
                                ))}
                            </ul>
                        </TabsContent>
                    );
                }
                if (idx === 2) {
                    const devotionalTab = tab as TabData<Devotional>;
                    return (
                        <TabsContent key={devotionalTab.value} value={devotionalTab.value}>
                            <ul className="space-y-4">
                                {devotionalTab.items.map((item) => (
                                    <li
                                        className="bg-white rounded-lg shadow p-4 border border-gray-200"
                                        key={item.id}
                                    >
                                        {devotionalTab.render(item)}
                                    </li>
                                ))}
                            </ul>
                        </TabsContent>
                    );
                }
                return null;
            })}
        </Tabs>
    );
};