"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = { url: string; className?: string };
// use "any" p/ compat imediata; se quiser strong typing, use o .d.ts que te passei
type PDFDocumentProxy = any;

/** HEAD helper para checar existência do worker */
async function headOk(src: string) {
  try {
    const r = await fetch(src, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}

export default function PdfViewer({ url, className }: Props) {
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages]);

  /** Detecta iOS/Safari (iPadOS desktop incluso) */
  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1)
    );
  }, []);

  /** Escolhe worker disponível; iOS prioriza .js */
  const pickWorker = useCallback(async () => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const jsFirst = [
      `${base}/pdfjs/build/pdf.worker.min.js`,
      `${base}/pdfjs/build/pdf.worker.js`,
      `${base}/pdfjs/build/pdf.worker.min.mjs`,
      `${base}/pdfjs/build/pdf.worker.mjs`,
    ];
    const mjsFirst = [
      `${base}/pdfjs/build/pdf.worker.min.mjs`,
      `${base}/pdfjs/build/pdf.worker.mjs`,
      `${base}/pdfjs/build/pdf.worker.min.js`,
      `${base}/pdfjs/build/pdf.worker.js`,
    ];
    const candidates = isIOS ? jsFirst : jsFirst; // se quiser priorizar .mjs no desktop, troque para mjsFirst
    for (const src of candidates) {
      if (await headOk(src)) return src;
    }
    // fallback final (tenta mesmo sem HEAD ok)
    return candidates[0];
  }, [isIOS]);

  /** Observa largura do container para fit-width */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) setContainerWidth(Math.max(0, Math.floor(e.contentRect.width)));
    });
    obs.observe(el);
    setContainerWidth(el.clientWidth);

    // extra: tratar rotação/orientation no iOS
    const onResize = () => setContainerWidth(el.clientWidth);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("resize", onResize);

    return () => {
      obs.disconnect();
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /** Carrega pdf.js + documento */
  useEffect(() => {
    let cancelled = false;
    let loadTask: any | null = null;

    (async () => {
      setReady(false);
      setError(null);
      try {
        const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = await pickWorker();

        // 1ª tentativa: URL (range requests)
        try {
          loadTask = pdfjs.getDocument({
            url,
            cMapUrl: `${basePath}/pdfjs/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `${basePath}/pdfjs/standard_fonts/`,
            withCredentials: false,
          });
          const doc = await loadTask.promise;
          if (cancelled) return;
          docRef.current = doc;
          setNumPages(doc.numPages);
          setReady(true);
          return;
        } catch {
          // Fallback: baixa arquivo e usa data (resolve muitos casos de CORS/Range)
          try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.arrayBuffer();
            loadTask = pdfjs.getDocument({
              data,
              cMapUrl: `${basePath}/pdfjs/cmaps/`,
              cMapPacked: true,
              standardFontDataUrl: `${basePath}/pdfjs/standard_fonts/`,
            });
            const doc = await loadTask.promise;
            if (cancelled) return;
            docRef.current = doc;
            setNumPages(doc.numPages);
            setReady(true);
            return;
          } catch {
            if (!cancelled) setError("Falha ao carregar o PDF (rede/CORS).");
          }
        }
      } catch {
        if (!cancelled) setError("Falha ao inicializar o visualizador.");
      }
    })();

    return () => {
      cancelled = true;
      try {
        loadTask?.destroy?.();
      } catch {}
      try {
        docRef.current?.destroy?.();
        docRef.current = null;
      } catch {}
    };
  }, [url, basePath, pickWorker]);

  return (
    <div className={`fixed inset-0 flex flex-col bg-background ${className ?? ""}`}>
      {/* Header simples (status) — toolbar virá depois */}
      <div className="px-3 py-2 text-sm border-b flex items-center justify-between">
        <span>{ready ? `Páginas: ${numPages}` : "Carregando..."}</span>
        {error && <span className="text-red-600">{error}</span>}
      </div>

      {/* Área de leitura (scroll contínuo) */}
      <div ref={containerRef} className="flex-1 overflow-auto">
        {ready && docRef.current ? (
          <div className="mx-auto max-w-[1100px] px-2 sm:px-4 py-4">
            {pages.map((pageNumber) => (
              <PageCanvas
                key={pageNumber}
                pageNumber={pageNumber}
                pdfDoc={docRef.current!}
                fitWidth={Math.max(320, containerWidth - 16)} // compensar padding
              />
            ))}
          </div>
        ) : (
          <div className="h-full grid place-items-center text-muted-foreground">
            Preparando visualização…
          </div>
        )}
      </div>
    </div>
  );
}

/** Canvas de página com render sob demanda (só quando visível) + fit-width + HiDPI */
function PageCanvas({
  pageNumber,
  pdfDoc,
  fitWidth,
}: {
  pageNumber: number;
  pdfDoc: any;
  fitWidth: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const [visible, setVisible] = useState(false);
  const [lastScale, setLastScale] = useState<number | null>(null);

  // observar visibilidade com prefetch (rootMargin)
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setVisible(e.isIntersecting);
      },
      { root: null, rootMargin: "800px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // renderiza quando visível ou quando mudar a largura disponível
  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!visible || !canvasRef.current) return;
      const page = await pdfDoc.getPage(pageNumber);

      // calcula escala "fit-width"
      const vp1 = page.getViewport({ scale: 1 });
      const scale = Math.max(0.5, Math.min(fitWidth / vp1.width, 3));
      if (lastScale !== null && Math.abs(scale - lastScale) < 0.02) {
        // evita render desnecessário se a variação de largura foi mínima
        return;
      }

      // HiDPI
      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      // Cancela render anterior (se houver)
      try {
        renderTaskRef.current?.cancel();
      } catch {}

      const transform = [dpr, 0, 0, dpr, 0, 0] as any;
      const task = page.render({ canvasContext: ctx, viewport, transform });
      renderTaskRef.current = task;

      try {
        await task.promise;
        try {
          page.cleanup?.();
        } catch {}
        if (!cancelled) setLastScale(scale);
      } catch {
        // ignore se for cancel/falha
      }
    }

    render();

    return () => {
      cancelled = true;
      try {
        renderTaskRef.current?.cancel();
      } catch {}
    };
  }, [visible, fitWidth, pageNumber, pdfDoc, lastScale]);

  return (
    <div ref={hostRef} className="w-full flex items-center justify-center my-4">
      <canvas ref={canvasRef} className="shadow-sm rounded" />
    </div>
  );
}
