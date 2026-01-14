"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { GroupingCard } from "./GroupingCard";

interface GroupingDaily {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
}

interface GroupingPickerModalProps {
  open: boolean;
  onClose?: () => void;
  groupings: GroupingDaily[];
}

export function GroupingPickerModal({
  open,
  onClose,
  groupings,
}: GroupingPickerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999">
      {/* Backdrop glass */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />

      {/* Modal content */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div
          className={cn(
            "relative h-full w-full max-w-5xl",
            "bg-background/80 backdrop-blur-2xl",
            "md:rounded-2xl md:my-6 md:h-[90%]",
            "shadow-2xl border border-white/10"
          )}
        >
          {/* Header (sem botão X) */}
          <header className="px-6 py-4 border-b border-white/10">
            <h1 className="text-xl font-semibold">
              Escolha seu plano diário
            </h1>
            <p className="text-sm text-muted-foreground">
              Selecione um plano para iniciar sua jornada espiritual
            </p>
          </header>

          {/* Body */}
          <main className="p-6 overflow-y-auto">
            {groupings.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                Nenhum plano disponível no momento.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {groupings.map((grouping) => (
                  <GroupingCard key={grouping.id} grouping={grouping} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 🔽 BOTÃO FLUTUANTE (canto inferior direito) */}
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            "fixed bottom-6 right-6 z-10000",
            "flex items-center gap-2 px-4 py-3",
            "rounded-full shadow-2xl",
            "bg-background/80 backdrop-blur-xl",
            "border border-white/20",
            "hover:bg-background/90 transition-all"
          )}
        >
          <X className="h-4 w-4" />
          <span className="text-sm font-medium">
            Escolher depois
          </span>
        </button>
      )}
    </div>
  );
}
