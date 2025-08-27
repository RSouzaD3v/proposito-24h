'use client';
import { useContext } from "react";
import { ThemeWriterContext } from "../../_contexts/ThemeWriterContext";

export const ButtonMode = () => {
    const { mode, changeMode } = useContext(ThemeWriterContext);

    return (
        <button
            onClick={changeMode}
            className="px-4 py-2 my-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
            {mode === "light" ? "Dark Mode" : "Light Mode"}
        </button>
    );
}