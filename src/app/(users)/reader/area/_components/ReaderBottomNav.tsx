"use client";

import { MenuPainel } from "./MenuPainel";
import { useThemeWriter } from "../_contexts/ThemeWriterContext";

/** Bottom nav for all /reader/area routes, themed from writer colors. */
export function ReaderBottomNav() {
  const { theme } = useThemeWriter();

  return (
    <MenuPainel
      colors={{
        primary: theme.colorPrimary || "#2b6de5",
        secondary: theme.colorSecondary || "#5b9cff",
        buttonBg: theme.colorPrimary || "#2b6de5",
        buttonText: "#ffffff",
        text: "#1a2b4a",
        background: "#ffffff",
      }}
    />
  );
}
