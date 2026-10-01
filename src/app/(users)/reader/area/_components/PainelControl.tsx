"use client";

import { ButtonMode } from "../settings/_components/ButtonMode";
import PlaySong from "./PlaySong";
import { cn } from "@/lib/utils";

export const PainelControl = () => {
  return (
    <div
      className={cn(
        "glass-surface fixed right-3 top-16 z-[999999] flex max-w-40 items-center justify-center gap-1 rounded-full p-1 md:right-4 md:top-3 md:p-1.5"
      )}
    >
      <PlaySong />
      <ButtonMode />
    </div>
  );
};
