"use client";
import { useState } from "react";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redireciona pro portal da Stripe
      } else {
        alert("Erro ao abrir portal de assinatura");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao abrir portal de assinatura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
    >
      {loading ? "Abrindo..." : "Gerenciar Assinatura"}
    </button>
  );
}
