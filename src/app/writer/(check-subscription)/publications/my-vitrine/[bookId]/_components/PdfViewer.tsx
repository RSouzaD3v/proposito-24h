"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = { url: string; className?: string };

type PdfModule = typeof import("pdfjs-dist/build/pdf.mjs");
type PDFDocumentProxy = any;

export default function PdfViewer({ url, className }: Props) {
  // guarda módulo pdf.js e doc carregado
  const pdfjsRef = useRef<PdfModule | null>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages]);

  // escolhe worker existente (mjs/js)
  const pickWorker = useCallback(async () => {
    const candidates = [
      `${basePath}/pdfjs/build/pdf.worker.min.mjs`,
      `${basePath}/pdfjs/build/pdf.worker.mjs`,
      `${basePath}/pdfjs/build/pdf.worker.min.js`,
      `${basePath}/pdfjs/build/pdf.worker.js`,
    ];
    for (const src of candidates) {
      try {
        const r = await fetch(src, { method: "HEAD" });
        if (r.ok) return src;
      } catch {}
    }
    return candidates[0];
  }, [basePath]);

  // observa largura do container para recalcular fit-width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) setContainerWidth(Math.max(0, Math.floor(e.contentRect.width)));
    });
    obs.observe(el);
    setContainerWidth(el.clientWidth);
    return () => obs.disconnect();
  }, []);

  // carrega pdf.js + documento
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setReady(false);
      setError(null);
      try {
        const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = await pickWorker();
        pdfjsRef.current = pdfjs;

        // 1ª tentativa: by URL (range requests)
        try {
          const task = pdfjs.getDocument({
            url,
            cMapUrl: `${basePath}/pdfjs/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `${basePath}/pdfjs/standard_fonts/`,
            withCredentials: false,
          });
          const doc = await task.promise;
          if (cancelled) return;
          docRef.current = doc;
          setNumPages(doc.numPages);
          setReady(true);
          return;
        } catch {
          // Fallback: baixa arquivo e usa data
          const resp = await fetch(url);
          const data = await resp.arrayBuffer();
          const task = pdfjs.getDocument({
            data,
            cMapUrl: `${basePath}/pdfjs/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `${basePath}/pdfjs/standard_fonts/`,
          });
          const doc = await task.promise;
          if (cancelled) return;
          docRef.current = doc;
          setNumPages(doc.numPages);
          setReady(true);
          return;
        }
      } catch (e) {
        if (!cancelled) setError("Falha ao carregar o PDF.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, basePath, pickWorker]);

  return (
    <div className={`fixed inset-0 flex flex-col bg-background ${className ?? ""}`}>
      {/* Header simples (status) — sem toolbar ainda */}
      <div className="px-3 py-2 text-sm border-b flex items-center justify-between">
        <span>{ready ? `Páginas: ${numPages}` : "Carregando..."}</span>
        {error && <span className="text-red-600">{error}</span>}
      </div>

      {/* Área de leitura (scroll) */}
      <div ref={containerRef} className="flex-1 overflow-auto">
        {ready && docRef.current && pdfjsRef.current ? (
          <div className="mx-auto max-w-[1100px] px-2 sm:px-4 py-4">
            {pages.map((pageNumber) => (
              <PageCanvas
                key={pageNumber}
                pageNumber={pageNumber}
                pdfjs={pdfjsRef.current!}
                pdfDoc={docRef.current!}
                fitWidth={Math.max(320, containerWidth - 16)} // padding compensado
              />
            ))}
          </div>
        ) : (
          <div className="h-full grid place-items-center text-muted-foreground">Preparando visualização…</div>
        )}
      </div>
    </div>
  );
}

/** Canvas de página com render sob demanda (só quando visível) + fit-width + HiDPI */
function PageCanvas({
  pageNumber,
  pdfjs,
  pdfDoc,
  fitWidth,
}: {
  pageNumber: number;
  pdfjs: PdfModule;
  pdfDoc: any;
  fitWidth: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const [visible, setVisible] = useState(false);
  const [lastScale, setLastScale] = useState<number | null>(null);

  // observar visibilidade
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setVisible(e.isIntersecting);
      },
      { root: null, rootMargin: "400px 0px", threshold: 0.01 }
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
      if (lastScale !== null && Math.abs(scale - lastScale) < 0.02) return; // evita render desnecessário

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
        if (!cancelled) setLastScale(scale);
      } catch (e) {
        // ignore se for cancel
      }
    }

    render();

    return () => {
      cancelled = true;
      try {
        renderTaskRef.current?.cancel();
      } catch {}
    };
  }, [visible, fitWidth, pageNumber, pdfDoc]);

  return (
    <div ref={hostRef} className="w-full flex items-center justify-center my-4">
      <canvas ref={canvasRef} className="shadow-sm rounded" />
    </div>
  );
}
