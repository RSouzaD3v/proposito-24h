"use client";
import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

export default function PdfViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderPDF = async () => {
      if (!containerRef.current) return;

      // Limpa canvases antigos ao recarregar
      containerRef.current.innerHTML = "";

      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        // Responsividade: calcula escala baseada na largura do container
        const containerWidth = containerRef.current.offsetWidth || 320;
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const responsiveViewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = responsiveViewport.height;
        canvas.width = responsiveViewport.width;
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.maxWidth = "100%";
        canvas.style.display = "block";

        await page.render({ canvasContext: context, viewport: responsiveViewport, canvas }).promise;
        containerRef.current.appendChild(canvas);
      }
    };

    renderPDF();

    // Re-renderiza ao redimensionar a tela
    const handleResize = () => renderPDF();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [url]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-4 items-center bg-white p-4 rounded-md w-full"
      style={{ userSelect: "none", width: "100%", overflowX: "auto" }}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
