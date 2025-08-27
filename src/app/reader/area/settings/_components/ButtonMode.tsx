'use client';

import { useContext } from "react";
import { ThemeWriterContext } from "../../_contexts/ThemeWriterContext";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const ButtonMode = () => {
    const { mode, changeMode } = useContext(ThemeWriterContext);

    const isDarkMode = mode === "dark";
    const label = isDarkMode ? "Dark Mode" : "Light Mode";

    return (
        <div className="flex items-center my-3 gap-2">
            <Switch
            id="theme-switch"
            checked={isDarkMode}
            onCheckedChange={changeMode}
            className="transition-colors scale-120"
            />
            <Label htmlFor="theme-switch" className="text-xl font-medium">
            {label}
            </Label>
        </div>
    );
};