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
                "p-2 rounded-full transition",
                isDarkMode
                    ? "text-sky-400 hover:text-sky-300"
                    : "text-yellow-400 hover:text-yellow-300",
            ].join(" ")}
            aria-label={isDarkMode ? "Ativar tema claro" : "Ativar tema escuro"}
            title={isDarkMode ? "Tema claro" : "Tema escuro"}
        >
            {isDarkMode ? <Moon size={24} aria-hidden /> : <Sun size={24} aria-hidden />}
        </button>
    );
};
