'use client';
import { useState } from 'react';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/v1/auth/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        setMessage(
            res.ok
                ? "Se o e-mail estiver cadastrado, você receberá um link em instantes."
                : "Não foi possível enviar agora. Tente novamente."
        );
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="text-center max-w-sm w-full p-6 shadow-md rounded-lg bg-white">
                <h1 className="text-2xl mb-4 text-gray-800">Esqueceu sua senha</h1>
                <p className="text-sm mb-6 text-gray-600">
                    Insira seu endereço de e-mail abaixo e enviaremos um link para redefinir sua senha.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Endereço de e-mail"
                        className="w-full p-3 mb-4 border border-gray-300 rounded text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                        Enviar link de redefinição
                    </button>
                </form>
                {message && <p role="status" className="text-sm mt-4 text-gray-600">{message}</p>}
            </div>
        </div>
    );
}
