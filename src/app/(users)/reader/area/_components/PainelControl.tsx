"use client";

import { ButtonMode } from "../settings/_components/ButtonMode";
import PlaySong from "./PlaySong";
import { cn } from "@/lib/utils";

export const PainelControl = () => {
  return (
    <div
      data-reader-chrome
      className={cn(
        "glass-surface fixed right-3 top-3 z-[60] flex items-center justify-center gap-0.5 rounded-full p-1 md:right-4"
      )}
    >
      <PlaySong />
      <ButtonMode />
    </div>
  );
};
