import React from 'react';

export default function ForgotPassword() {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="text-center max-w-sm w-full p-6 shadow-md rounded-lg bg-white">
                <h1 className="text-2xl mb-4 text-gray-800">Esqueceu sua senha</h1>
                <p className="text-sm mb-6 text-gray-600">
                    Insira seu endereço de e-mail abaixo e enviaremos um link para redefinir sua senha.
                </p>
                <form>
                    <input
                        type="email"
                        placeholder="Endereço de e-mail"
                        className="w-full p-3 mb-4 border border-gray-300 rounded text-sm"
                    />
                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                        Enviar link de redefinição
                    </button>
                </form>
            </div>
        </div>
    );
}
