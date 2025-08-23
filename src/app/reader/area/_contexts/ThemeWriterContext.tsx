'use client';
import { useState, createContext, useEffect, useContext } from "react";

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
}

export const ThemeWriterContext = createContext<ThemeWriterContextProps>({
    theme: {
        logoUrl:        "",
        colorPrimary:   "",
        colorSecondary: ""
    },
    setTheme: () => {}
});

export const ThemeWriterProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState({
        logoUrl:        "",
        colorPrimary:   "",
        colorSecondary: ""
    });

    useEffect(() => {
        const fetchTheme = async () => {
            if (localStorage.getItem("themeWriter")) {
                setTheme(JSON.parse(localStorage.getItem("themeWriter")!));
            }
            else {
                try {
                    const response = await fetch("/api/theme");
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

    return (
        <ThemeWriterContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeWriterContext.Provider>
    );
};

export const useThemeWriter = () => useContext(ThemeWriterContext);