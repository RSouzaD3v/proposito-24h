"use client";

import { useState } from "react";

type Props = {
  writerId: string;
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function SubscribeButton({
  writerId,
  planId,
  successUrl,
  cancelUrl,
  className,
  children = "Assinar",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/writer/${writerId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, successUrl, cancelUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao iniciar checkout");
      window.location.href = data.url;
    } catch (err: any) {
      alert(err.message || "Erro ao redirecionar para o checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className ?? "px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"}
    >
      {loading ? "Redirecionando..." : children}
    </button>
  );
}
