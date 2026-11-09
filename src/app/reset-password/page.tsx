'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function ResetPasswordForm() {
    const token = useSearchParams().get('token') ?? '';
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmation) {
            setError('As senhas não coincidem.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/v1/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) setDone(true);
            else setError(data.message || 'Não foi possível redefinir a senha.');
        } catch {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <>
                <p className="text-sm mb-6 text-gray-600">Sua senha foi alterada.</p>
                <Link href="/login" className="text-sm text-blue-600 hover:underline">Ir para o login</Link>
            </>
        );
    }

    if (!token) {
        return (
            <>
                <p className="text-sm mb-6 text-gray-600">Este link é inválido.</p>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">Solicitar novo link</Link>
            </>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Nova senha"
                className="w-full p-3 mb-4 border border-gray-300 rounded text-sm text-gray-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Confirme a nova senha"
                className="w-full p-3 mb-4 border border-gray-300 rounded text-sm text-gray-800"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
            />
            {error && <p role="alert" className="text-sm mb-4 text-red-600">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="w-full p-3 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-60"
            >
                {loading ? 'Salvando...' : 'Redefinir senha'}
            </button>
        </form>
    );
}

export default function ResetPassword() {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="text-center max-w-sm w-full p-6 shadow-md rounded-lg bg-white">
                <h1 className="text-2xl mb-4 text-gray-800">Redefinir senha</h1>
                <Suspense>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
