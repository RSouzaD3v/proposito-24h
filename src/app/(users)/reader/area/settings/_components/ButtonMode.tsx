"use client";

import { useContext } from "react";
import { ThemeWriterContext } from "../../_contexts/ThemeWriterContext";
import { Sun, Moon } from "lucide-react";

export const ButtonMode = () => {
    const { mode, changeMode } = useContext(ThemeWriterContext);
    const isDarkMode = mode === "dark";

    return (
        <button
            type="button"
            onClick={changeMode}
            className={[
                "flex size-9 items-center justify-center rounded-full text-[var(--reader-gold)] transition hover:bg-[var(--muted)]",
            ].join(" ")}
            aria-label={isDarkMode ? "Ativar tema claro" : "Ativar tema escuro"}
            title={isDarkMode ? "Tema claro" : "Tema escuro"}
        >
            {isDarkMode ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
        </button>
    );
};
