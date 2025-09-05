"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  url: string;            // URL pública do S3/CloudFront
  filename?: string;      // opcional (para botão "Baixar")
  autoOpen?: boolean;     // padrão: true (redireciona automaticamente)
  className?: string;
};

export default function PdfViewer({
  url,
  filename = "documento.pdf",
  autoOpen = true,
  className,
}: Props) {
  const [triedAuto, setTriedAuto] = useState(false);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  // Usa a rota do seu domínio para não expor a URL direta (e melhorar UX)
  const nativeUrl = useMemo(
    () => `/api/pdf-redirect?u=${encodeURIComponent(url)}`,
    [url]
  );

  // Redireciona automaticamente (abre o viewer nativo no mesmo tab)
  useEffect(() => {
    if (!autoOpen || triedAuto) return;
    setTriedAuto(true);
    // usar replace() evita criar histórico extra
    window.location.replace(nativeUrl);
  }, [autoOpen, nativeUrl, triedAuto]);

  function openNow() {
    window.location.href = nativeUrl;
  }

  function downloadNow() {
    // Observação: 'download' pode ser ignorado em cross-origin.
    // Para forçar download, configure Content-Disposition no S3.
    const a = document.createElement("a");
    a.href = url;            // usa direto o S3 (mais chances do 'download' funcionar)
    a.download = filename;   // pode ser ignorado, depende do navegador/CORS
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function shareNow() {
    if (!canShare) return;
    try {
      await navigator.share({ url: url, title: filename, text: "Abrir PDF" });
    } catch {
      // usuário cancelou — ignorar
    }
  }

  return (
    <div className={`min-h-[60vh] flex items-center justify-center ${className ?? ""}`}>
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-lg font-semibold text-black">Abrir PDF no leitor do dispositivo</h2>
        <p className="text-sm text-muted-foreground max-w-[420px]">
          Estamos redirecionando para o leitor nativo. Se não abrir automaticamente, use os botões abaixo.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <button onClick={openNow} className="px-4 py-2 text-black bg-white rounded border font-medium">
            Abrir agora
          </button>

          <button onClick={downloadNow} className="px-4 py-2 text-black bg-white rounded border font-medium">
            Baixar PDF
          </button>

          {canShare && (
            <button onClick={shareNow} className="px-4 py-2 rounded border font-medium">
              Compartilhar…
            </button>
          )}
        </div>

        {/* Fallback em link puro */}
        <div className="mt-3">
          <a
            href={nativeUrl}
            className="text-sm underline opacity-80 hover:opacity-100"
            rel="noopener noreferrer"
          >
            Abrir via redirecionamento
          </a>
        </div>
      </div>
    </div>
  );
}
