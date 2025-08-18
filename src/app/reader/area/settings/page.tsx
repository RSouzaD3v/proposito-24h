import React from "react";
import { MenuPainel } from "../_components/MenuPainel";
import Logout from "../_components/Logout";

export default function SettingsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-200 via-blue-100 to-white rounded-2xl shadow-2xl p-10">
            <div className="">
                <Logout />
                <MenuPainel />
            </div>
        </div>
    );
}
