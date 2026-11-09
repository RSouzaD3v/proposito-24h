"use client";

import { useContext } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeWriterContext } from "../../_contexts/ThemeWriterContext";
import { SettingsIcon } from "@/components/settings/SettingsList";

const OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
] as const;

export function ThemeSwitch() {
  const { mode, changeMode } = useContext(ThemeWriterContext);

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <SettingsIcon icon={Palette} />
      <span id="theme-label" className="flex-1 text-[15px] font-medium text-[var(--liquid-ink)]">
        Tema
      </span>
      <div role="radiogroup" aria-labelledby="theme-label" className="flex rounded-xl bg-[var(--muted)] p-1">
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => !active && changeMode()}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition",
                active
                  ? "bg-[var(--reader-surface)] text-[var(--liquid-ink)] shadow-sm"
                  : "text-[var(--liquid-muted)] hover:text-[var(--liquid-ink)]",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
