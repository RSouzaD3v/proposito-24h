'use client';
import { useState, createContext, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";

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

export const ThemeWriterProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [theme, setTheme] = useState({
        logoUrl:        "",
        colorPrimary:   "",
        colorSecondary: ""
    });

    const [mode, setMode] = useState<"light" | "dark">("light");

    useEffect(() => {
        const fetchTheme = async () => {
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
    }, []);

    // Modais são renderizados no body, fora do wrapper do tema.
    useEffect(() => {
        document.body.classList.add("reader-app");
        return () => document.body.classList.remove("reader-app");
    }, []);

    useEffect(() => {
        document.body.classList.toggle("dark", mode === "dark");
        return () => document.body.classList.remove("dark");
    }, [mode]);

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
        setMode(prev => { 
            if (prev === 'dark') {
                localStorage.setItem('themeMode', 'light')
                return 'light'
            } else {
                localStorage.setItem('themeMode', 'dark')
                return 'dark'
            }
         });

         if (window) {
             window.location.reload();
         } else {
             router.refresh();
         }
    }

    return (
        <ThemeWriterContext.Provider value={{ theme, setTheme, mode, setMode, changeMode }}>
            <div
              className={`${mode === "dark" ? "text-white dark" : "text-[var(--liquid-ink)]"} transition-colors duration-300`}
            >
                {children}
            </div>
        </ThemeWriterContext.Provider>
    );
};

export const useThemeWriter = () => useContext(ThemeWriterContext);