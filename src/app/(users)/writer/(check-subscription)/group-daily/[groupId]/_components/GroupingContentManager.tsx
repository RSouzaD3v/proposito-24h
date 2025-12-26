"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";

import {
  addDevotionalToGroupAction,
  addQuoteToGroupAction,
  addPrayerToGroupAction,
  addVerseToGroupAction,
  removeDevotionalFromGroupAction,
  removeQuoteFromGroupAction,
  removePrayerFromGroupAction,
  removeVerseFromGroupAction,
} from "../../actions";

interface Props {
  groupId: string;
  devotionals: any[];
  quotes: any[];
  prayers: any[];
  verses: any[];
  groupedIds: {
    devotionals: string[];
    quotes: string[];
    prayers: string[];
    verses: string[];
  };
}

export function GroupingContentManager({
  groupId,
  devotionals,
  quotes,
  prayers,
  verses,
  groupedIds,
}: Props) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Sets para checagem rápida
  const grouped = useMemo(() => {
    return {
      devotionals: new Set(groupedIds.devotionals),
      quotes: new Set(groupedIds.quotes),
      prayers: new Set(groupedIds.prayers),
      verses: new Set(groupedIds.verses),
    };
  }, [groupedIds]);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* SEARCH */}
        <Input
          placeholder="Buscar por título, conteúdo ou referência..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABS */}
        <Tabs defaultValue="devotionals" className="w-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="devotionals">Devocionais</TabsTrigger>
            <TabsTrigger value="quotes">Citações</TabsTrigger>
            <TabsTrigger value="prayers">Orações</TabsTrigger>
            <TabsTrigger value="verses">Versículos</TabsTrigger>
          </TabsList>

          {/* DEVOCIONAIS */}
          <TabsContent value="devotionals">
            <ItemList
              items={devotionals}
              search={search}
              isAdded={(id) => grouped.devotionals.has(id)}
              getTitle={(i) => i.title}
              getContent={(i) => i.content}
              onAdd={(id) =>
                startTransition(() => {
                  void addDevotionalToGroupAction(groupId, id);
                })
              }
              onRemove={(id) =>
                startTransition(() => {
                  void removeDevotionalFromGroupAction(groupId, id);
                })
              }
              isPending={isPending}
            />
          </TabsContent>

          {/* CITAÇÕES */}
          <TabsContent value="quotes">
            <ItemList
              items={quotes}
              search={search}
              isAdded={(id) => grouped.quotes.has(id)}
              getTitle={(i) => i.nameAuthor}
              getContent={(i) => i.content}
              onAdd={(id) =>
                startTransition(() => {
                  void addQuoteToGroupAction(groupId, id);
                })
              }
              onRemove={(id) =>
                startTransition(() => {
                  void removeQuoteFromGroupAction(groupId, id);
                })
              }
              isPending={isPending}
            />
          </TabsContent>

          {/* ORAÇÕES */}
          <TabsContent value="prayers">
            <ItemList
              items={prayers}
              search={search}
              isAdded={(id) => grouped.prayers.has(id)}
              getTitle={(i) => i.title}
              getContent={(i) => i.content}
              onAdd={(id) =>
                startTransition(() => {
                  void addPrayerToGroupAction(groupId, id);
                })
              }
              onRemove={(id) =>
                startTransition(() => {
                  void removePrayerFromGroupAction(groupId, id);
                })
              }
              isPending={isPending}
            />
          </TabsContent>

          {/* VERSÍCULOS */}
          <TabsContent value="verses">
            <ItemList
              items={verses}
              search={search}
              isAdded={(id) => grouped.verses.has(id)}
              getTitle={(i) => i.reference}
              getContent={(i) => i.content}
              onAdd={(id) =>
                startTransition(() => {
                  void addVerseToGroupAction(groupId, id);
                })
              }
              onRemove={(id) =>
                startTransition(() => {
                  void removeVerseFromGroupAction(groupId, id);
                })
              }
              isPending={isPending}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

/* ======================================================
 * LISTA GENÉRICA
 * ====================================================== */

function ItemList<T extends { id: string }>({
  items,
  search,
  isAdded,
  getTitle,
  getContent,
  onAdd,
  onRemove,
  isPending,
}: {
  items: T[];
  search: string;
  isAdded: (id: string) => boolean;
  getTitle: (item: T) => string;
  getContent: (item: T) => string;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  isPending: boolean;
}) {
  const filtered = useMemo(() => {
    if (!search) return items;

    return items.filter((item) =>
      `${getTitle(item)} ${getContent(item)}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [items, search, getTitle, getContent]);

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Nenhum item encontrado.
      </p>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {filtered.map((item) => {
        const added = isAdded(item.id);

        return (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 border rounded-md p-3"
          >
            <div className="space-y-1">
              <p className="font-medium text-sm">
                {getTitle(item)}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {getContent(item)}
              </p>
            </div>

            <Button
              size="sm"
              variant={added ? "destructive" : "default"}
              disabled={isPending}
              className="gap-1 shrink-0"
              onClick={() => {
                if (added) {
                  onRemove(item.id);
                } else {
                  onAdd(item.id);
                }
              }}
            >
              {added ? (
                <>
                  <X size={14} />
                  Remover
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Adicionar
                </>
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
