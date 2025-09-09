import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Devotional, Prayer, Quote, Verse } from "@prisma/client";
import Link from "next/link";

interface SectionsDailyTypes {
  quotes: Quote[];
  verses: Verse[];
  devotionals: Devotional[];
  prayers: Prayer[];
}

function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

function getDisplayDate(item: any) {
  return formatDate(item?.date ?? item?.createdAt);
}

export const SectionsDaily = ({
  quotes = [],
  verses = [],
  devotionals = [],
  prayers = [],
}: SectionsDailyTypes) => {
  type TabKey = "quotes" | "verses" | "prayers" | "devotionals";
  type AnyItem = Quote | Verse | Prayer | Devotional;

  type TabData = {
    value: TabKey;
    label: string;
    items: AnyItem[];
    render: (item: AnyItem) => React.ReactNode;
  };

  const tabData: TabData[] = [
    {
      value: "quotes",
      label: "Citações",
      items: quotes,
      render: (raw) => {
        const item = raw as Quote;
        return (
          <div>
            <span className="font-semibold">{item.nameAuthor}</span>
            <p className="text-gray-700">{truncate(item.content, 120)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Data de exibição: {getDisplayDate(item)}
            </p>
            <div className="mt-5">
              <Link
                className="bg-blue-500 text-white font-bold hover:bg-blue-700 p-1 px-3 rounded-sm"
                href={`/writer/daily/quote/edit/${item.id}`}
              >
                Editar
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      value: "verses",
      label: "Versículos",
      items: verses,
      render: (raw) => {
        const item = raw as Verse;
        return (
          <div>
            <span className="font-semibold">{item.reference}</span>
            <p className="text-gray-700">{truncate(item.content, 200)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Data de exibição: {getDisplayDate(item)}
            </p>
            <div className="mt-5">
              <Link
                className="bg-blue-500 text-white font-bold hover:bg-blue-700 p-1 px-3 rounded-sm"
                href={`/writer/daily/verse/edit/${item.id}`}
              >
                Editar
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      value: "prayers",
      label: "Orações",
      items: prayers,
      render: (raw) => {
        const item = raw as Prayer;
        return (
          <div>
            <span className="font-semibold">{item.title}</span>
            <p className="text-gray-700">{truncate(item.content, 200)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Data de exibição: {getDisplayDate(item)}
            </p>
            <div className="mt-5">
              <Link
                className="bg-blue-500 text-white font-bold hover:bg-blue-700 p-1 px-3 rounded-sm"
                href={`/writer/daily/prayer/edit/${item.id}`}
              >
                Editar
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      value: "devotionals",
      label: "Devocionais",
      items: devotionals,
      render: (raw) => {
        const item = raw as Devotional;
        return (
          <div>
            <span className="font-semibold">{item.title}</span>
            <p className="text-gray-700">{truncate((item as any).content ?? "", 200)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Data de exibição: {getDisplayDate(item)}
            </p>
            <div className="mt-5">
              <Link
                className="bg-blue-500 text-white font-bold hover:bg-blue-700 p-1 px-3 rounded-sm"
                href={`/writer/daily/devotional/edit/${item.id}`}
              >
                Editar
              </Link>
            </div>
          </div>
        );
      },
    },
  ];

  const defaultTab: TabKey =
    (["quotes", "verses", "prayers", "devotionals"] as TabKey[]).find((key) => {
      const t = tabData.find((x) => x.value === key);
      return t && (t.items?.length ?? 0) > 0;
    }) ?? "quotes";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="bg-gray-100 rounded-lg p-1 mb-4 flex gap-2 flex-wrap">
        {tabData.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-4 py-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white transition"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabData.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {(tab.items?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500">Nenhum registro encontrado.</p>
          ) : (
            <ul className="space-y-4">
              {tab.items.map((item: AnyItem) => (
                <li
                  className="bg-white rounded-lg shadow p-4 border border-gray-200"
                  key={(item as any).id}
                >
                  {tab.render(item)}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};
