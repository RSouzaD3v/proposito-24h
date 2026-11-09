"use client";
import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, [key]);

  // Só grava depois de ler, para o valor inicial não apagar o progresso salvo.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state, loaded]);

  return [state, setState] as const;
}
