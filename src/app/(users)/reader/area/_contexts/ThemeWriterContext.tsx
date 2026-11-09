'use client';
import { useState, createContext, useEffect, useContext } from "react";

/** Escolhe texto claro ou escuro conforme a cor do escritor. */
function readableOn(color: string) {
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
    if (!match) return "#ffffff";
    const hex = match[1].length === 3 ? match[1].replace(/./g, "$&$&") : match[1];
    const [r, g, b] = [0, 2, 4].map((start) => parseInt(hex.slice(start, start + 2), 16));
    return (r * 299 + g * 587 + b * 114) / 1000 > 165 ? "#241c15" : "#ffffff";
}

interface ThemeWriterContextProps {
    theme: {
        logoUrl:        string;
        colorPrimary:   string;
        colorSecondary: string;
    };
    setTheme: React.Dispatch<React.SetStateAction<{
        logoUrl:        string;
        colorPrimary:   string;
        colorSecondary: string;
    }>>;
    mode: "light" | "dark";
    setMode: React.Dispatch<React.SetStateAction<"light" | "dark">>;
    changeMode: () => void;
}

export const ThemeWriterContext = createContext<ThemeWriterContextProps>({
    theme: {
        logoUrl:        "",
        colorPrimary:   "",
        colorSecondary: ""
    },
    setTheme: () => {},
    mode: "light",
    setMode: () => {},
    changeMode: () => null
});

type WriterTheme = ThemeWriterContextProps["theme"];

/** `preview` usa as cores informadas e o modo da URL, sem ler nem gravar as preferências do leitor. */
export const ThemeWriterProvider = ({ children, preview }: { children: React.ReactNode; preview?: WriterTheme }) => {
    const [theme, setTheme] = useState({
        logoUrl:        "",
        colorPrimary:   "",
        colorSecondary: ""
    });

    const [mode, setMode] = useState<"light" | "dark">("light");

    useEffect(() => {
        const fetchTheme = async () => {
            if (preview) {
                setTheme(preview);
                setMode(new URLSearchParams(window.location.search).get("mode") === "dark" ? "dark" : "light");
                return;
            }

            if (localStorage.getItem("themeMode")) {
                setMode(localStorage.getItem("themeMode") as "light" | "dark");
            };

            if (localStorage.getItem("themeWriter")) {
                setTheme(JSON.parse(localStorage.getItem("themeWriter")!));
            }
            else {
                try {
                    const response = await fetch("/api/v1/reader/theme");
                    if (!response.ok) {
                        throw new Error("Failed to fetch theme");
                    }
                    const data = await response.json();
                    setTheme(data.theme);
                    localStorage.setItem("themeWriter", JSON.stringify(data.theme));
                } catch (e) {
                    console.log(e);
                }
            }
        }

        fetchTheme();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- as cores valem desde a montagem.
    }, []);

    // Modais são renderizados no body, fora do wrapper do tema.
    useEffect(() => {
        document.body.classList.add("reader-app");
        return () => document.body.classList.remove("reader-app");
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", mode === "dark");
    }, [mode]);

    // O tema escuro vale só na área do leitor.
    useEffect(() => () => document.documentElement.classList.remove("dark"), []);

    useEffect(() => {
        const root = document.documentElement.style;
        if (theme?.colorPrimary) {
            root.setProperty("--reader-writer-accent", theme.colorPrimary);
            root.setProperty("--reader-writer-on-accent", readableOn(theme.colorPrimary));
        }
        return () => {
            root.removeProperty("--reader-writer-accent");
            root.removeProperty("--reader-writer-on-accent");
        };
    }, [theme?.colorPrimary]);

    const changeMode = () => {
        const next = mode === "dark" ? "light" : "dark";
        localStorage.setItem("themeMode", next);

        const apply = () => {
            document.documentElement.classList.toggle("dark", next === "dark");
            setMode(next);
        };

        // Navegadores sem View Transitions trocam o tema sem a animação.
        if (document.startViewTransition) document.startViewTransition(apply);
        else apply();
    }

    return (
        <ThemeWriterContext.Provider value={{ theme, setTheme, mode, setMode, changeMode }}>
            {children}
        </ThemeWriterContext.Provider>
    );
};

export const useThemeWriter = () => useContext(ThemeWriterContext);