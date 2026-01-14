"use client";

import { useTransition } from "react";

interface GroupingDaily {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
}

export function GroupingCard({ grouping }: { grouping: GroupingDaily }) {
  const [isPending, startTransition] = useTransition();

  const onSelect = () => {
    startTransition(async () => {
      await fetch("/api/grouping/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupingDailyId: grouping.id }),
      });

      // 🔥 força reload pra layout recalcular
      window.location.reload();
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
      <div className="relative h-40">
        {grouping.imageUrl ? (
          <img
            src={grouping.imageUrl}
            alt={grouping.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary/10">
            Plano Diário
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg">{grouping.title}</h3>

        {grouping.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {grouping.description}
          </p>
        )}

        <button
          onClick={onSelect}
          disabled={isPending}
          className="
            w-full rounded-lg py-2 text-sm font-medium
            bg-primary text-primary-foreground
            hover:opacity-90 transition
            disabled:opacity-50
          "
        >
          {isPending ? "Iniciando..." : "Selecionar"}
        </button>
      </div>
    </div>
  );
}
