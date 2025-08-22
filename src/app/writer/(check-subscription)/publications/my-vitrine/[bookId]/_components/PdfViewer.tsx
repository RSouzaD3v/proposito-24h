"use client";
import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// aponta direto para o worker que já vem no pacote
pdfjsLib.GlobalWorkerOptions.workerSrc =
  new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

export default function PdfViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderPDF = async () => {
      if (!containerRef.current) return;

      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.4 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport, canvas }).promise;
        containerRef.current.appendChild(canvas);
      }
    };

    renderPDF();
  }, [url]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-4 items-center bg-white p-4 rounded-md"
      style={{ userSelect: "none" }}
      onContextMenu={(e) => e.preventDefault()} // bloqueia clique direito
    />
  );
}
