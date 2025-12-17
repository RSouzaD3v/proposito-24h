"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export default function DailyList({
  items, type
}: {
  items: any[];
  type: string
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum conteúdo encontrado.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/reader/area/${type}/${item.id}`}
          className="block"
        >
          <Card className="p-4 space-y-2 cursor-pointer transition hover:bg-muted/40">
            <p className="text-lg font-medium">
              {item.title ?? item.text}
            </p>

            {item.content && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {item.content}
              </p>
            )}

            <span className="text-xs text-muted-foreground">
              {format(new Date(item.createdAt), "dd 'de' MMMM yyyy", {
                locale: ptBR,
              })}
            </span>
          </Card>
        </Link>
      ))}
    </div>
  );
}
