import React from "react";
import { MenuPainel } from "../_components/MenuPainel";
import Logout from "../_components/Logout";
import { ThemeWriterProvider } from "../_contexts/ThemeWriterContext";
import { Plans } from "./_components/Plans";

export default function SettingsPage() {
    return (
        <ThemeWriterProvider>
            <div className="flex flex-col space-y-2 items-center justify-center min-h-screen rounded-2xl shadow-2xl p-10">
                <Plans />
                <Logout />
                <MenuPainel />
            </div>
        </ThemeWriterProvider>
    );
}
