"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompleteStep({
  kind,
  id,
  completed,
}: {
  kind: "devotional" | "prayer" | "quote" | "verse";
  id: string;
  completed?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (completed) {
    return (
      <p className="flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
        <Check className="size-4" strokeWidth={3} /> Etapa concluída
      </p>
    );
  }

  async function complete() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/reader/content/${kind}/${id}/complete`, { method: "POST" });
      if (!response.ok) throw new Error();
      router.push("/reader/area/");
    } catch {
      setError("Não foi possível concluir. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="glass-primary" disabled={loading} onClick={complete} className="h-12 w-full rounded-full text-sm font-bold">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" strokeWidth={3} />}
        {loading ? "Concluindo..." : "Concluir esta etapa"}
      </Button>
      {error && <p role="alert" className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
