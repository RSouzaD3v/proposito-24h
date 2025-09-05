"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("reader/area error =>", error);
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-2">Ops! Algo deu errado nesta área.</h2>
      <p className="text-sm opacity-80">
        {error?.message || "Erro inesperado."}
        {error?.digest ? ` (digest: ${error.digest})` : null}
      </p>
      <button
        className="mt-4 px-4 py-2 rounded bg-black text-white"
        onClick={() => reset()}
      >
        Tentar novamente
      </button>
    </div>
  );
}
