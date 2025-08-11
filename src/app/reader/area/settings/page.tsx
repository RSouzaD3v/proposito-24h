import React from "react";

export default function SettingsPage() {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 flex flex-col items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">
                    Página de Configurações
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Esta página está sendo desenvolvida.<br />
                    Em breve você poderá personalizar suas configurações aqui!
                </p>
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 animate-pulse mb-4" />
                <span className="text-xs text-gray-400">Versão beta</span>
            </div>
        </div>
    );
}