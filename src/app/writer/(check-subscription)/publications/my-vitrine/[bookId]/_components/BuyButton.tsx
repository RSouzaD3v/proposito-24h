"use client";
import { useState } from "react";

export function BuyButton({ publicationId }: { publicationId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    try {
      setLoading(true);
      const res = await fetch(`/api/checkout/publication/${publicationId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Falha ao iniciar checkout");
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      console.error(e);
      alert("Não foi possível iniciar o pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      disabled={loading}
      onClick={handleBuy}
      className="px-4 py-2 rounded bg-blue-600 text-white"
    >
      {loading ? "Redirecionando..." : "Comprar"}
    </button>
  );
}
