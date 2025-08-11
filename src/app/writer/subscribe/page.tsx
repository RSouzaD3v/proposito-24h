'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';



export default function WriterSubscribePage() {
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const checkSubscription = async () => {
            const response = await fetch('/api/writer/me');
            const data = await response.json();
            setSubscribed(data.subscription !== null);

            const dateTime = new Date().getTime();

            if (data.subscription && data.subscription.endedAt > dateTime) {
                setSubscribed(true);
            }
        };

        checkSubscription();
    }, []);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            await fetch('/api/writer/subscribe', { method: 'POST' });
            setSubscribed(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)'
        }}>
            <div style={{
                background: '#fff',
                padding: '2.5rem 2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                maxWidth: 400,
                width: '100%',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#3730a3' }}>
                    Assine como Escritor
                </h1>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                    Receba acesso exclusivo para publicar seus textos e inspirar outras pessoas.
                </p>
                <button
                    onClick={handleSubscribe}
                    disabled={loading || subscribed}
                    style={{
                        background: subscribed ? '#22c55e' : '#6366f1',
                        color: '#fff',
                        padding: '0.75rem 2rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        cursor: loading || subscribed ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    {subscribed ? 'Inscrito!' : loading ? 'Inscrevendo...' : 'Inscrever-se'}
                </button>
                {subscribed && (
                    <div style={{ marginTop: '1.5rem', color: '#22c55e', fontWeight: 500 }}>
                        <h2>Obrigado por se inscrever!</h2>
                        <Link className='text-blue-500 hover:underline' href={"/writer/dashboard"}>
                            Acesse seu painel
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}