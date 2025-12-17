"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import DailyList from "./DailyList";
import Pagination from "./Pagination";

interface Props {
  tab: string;
  page: number;
  pageSize: number;
  data: {
    verses: any[];
    devotionals: any[];
    quotes: any[];
    prayers: any[];
  };
  total: {
    verses: number;
    devotionals: number;
    quotes: number;
    prayers: number
  };
}

export default function DailyTabs({
  tab,
  page,
  pageSize,
  data,
  total,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function changeTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    params.set("page", "1"); // reset page ao trocar aba
    router.push(`?${params.toString()}`);
  }

  return (
    <Tabs value={tab} onValueChange={changeTab} className="w-full">
      {/* 🔹 Tabs horizontais */}
      <TabsList className="inline-flex gap-2 mb-6">
        <TabsTrigger value="verses">Versículos</TabsTrigger>
        <TabsTrigger value="devotionals">Devocionais</TabsTrigger>
        <TabsTrigger value="quotes">Citações</TabsTrigger>
        <TabsTrigger value="quotes">Orações</TabsTrigger>
      </TabsList>

      {/* 🔽 Conteúdo */}
      <TabsContent value="verses" className="space-y-6">
        <DailyList items={data.verses} type={"verse"} />
        <Pagination
          currentPage={page}
          totalItems={total.verses}
          pageSize={pageSize}
          tab="verses"
        />
      </TabsContent>

      <TabsContent value="devotionals" className="space-y-6">
        <DailyList items={data.devotionals} type={"devotional"} />
        <Pagination
          currentPage={page}
          totalItems={total.devotionals}
          pageSize={pageSize}
          tab="devotionals"
        />
      </TabsContent>

      <TabsContent value="quotes" className="space-y-6">
        <DailyList items={data.quotes} type={"quote"} />
        <Pagination
          currentPage={page}
          totalItems={total.quotes}
          pageSize={pageSize}
          tab="quotes"
        />
      </TabsContent>

      <TabsContent value="prayers" className="space-y-6">
        <DailyList items={data.prayers} type={"prayer"} />
        <Pagination
          currentPage={page}
          totalItems={total.prayers}
          pageSize={pageSize}
          tab="prayers"
        />
      </TabsContent>
    </Tabs>
  );
}
