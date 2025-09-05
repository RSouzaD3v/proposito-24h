// src/types/pdfjs-dist.d.ts
declare module "pdfjs-dist/build/pdf.mjs" {
  // Tipos simplificados (baseado em PDF.js API)
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFPageProxy {
    getViewport(params: { scale: number }): PageViewport;
    render(params: {
      canvasContext: CanvasRenderingContext2D;
      viewport: PageViewport;
      transform?: number[];
    }): { promise: Promise<void>; cancel(): void };
    getTextContent(): Promise<any>;
  }

  export interface PageViewport {
    width: number;
    height: number;
  }

  export interface PDFWorkerOptions {
    workerSrc: string;
  }

  export interface GlobalWorkerOptions {
    workerSrc: string;
  }

  export interface GetDocumentParams {
    url?: string;
    data?: Uint8Array | ArrayBuffer;
    cMapUrl?: string;
    cMapPacked?: boolean;
    standardFontDataUrl?: string;
    withCredentials?: boolean;
  }

  export interface GetDocumentTask {
    promise: Promise<PDFDocumentProxy>;
    destroy(): void;
  }

  export function getDocument(
    params: string | GetDocumentParams
  ): GetDocumentTask;

  export const GlobalWorkerOptions: GlobalWorkerOptions;
}
