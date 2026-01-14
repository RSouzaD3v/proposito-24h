"use client";

import { useEffect, useState } from "react";
import { fireConfetti } from "@/lib/confetti";

export function GroupingCompletionGate() {
  const [canComplete, setCanComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grouping/status")
      .then(res => res.json())
      .then(data => {
        if (data.canComplete) {
          setCanComplete(true);
          fireConfetti(); // 🎉 DISPARA AQUI
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (!canComplete || loading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 max-w-md text-center shadow-2xl animate-scale-in">
        <h2 className="text-2xl font-bold mb-2">🎉 Parabéns!</h2>

        <p className="opacity-80 mb-4">
          Você concluiu todos os conteúdos deste plano.
        </p>

        <button
          onClick={async () => {
            await fetch("/api/grouping/complete", {
              method: "POST",
            });
            window.location.reload();
          }}
          className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:opacity-90 transition"
        >
          Concluir plano
        </button>
      </div>
    </div>
  );
}
