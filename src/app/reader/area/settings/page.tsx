import React from "react";
import { MenuPainel } from "../_components/MenuPainel";
import Logout from "../_components/Logout";
import { ButtonMode } from "./_components/ButtonMode";
import { ThemeWriterProvider } from "../_contexts/ThemeWriterContext";

export default function SettingsPage() {
    return (
        <ThemeWriterProvider>
            <div className="flex flex-col items-center justify-center min-h-screen rounded-2xl shadow-2xl p-10">
                <ButtonMode />
                <Logout />
                <MenuPainel />
            </div>
        </ThemeWriterProvider>
    );
}
