declare module "dom-to-image-more" {
  export interface DomToImageOptions {
    filter?: (node: HTMLElement) => boolean;
    bgcolor?: string;
    width?: number;
    height?: number;
    style?: Partial<CSSStyleDeclaration>;
    quality?: number; // usado em jpeg/webp
    cacheBust?: boolean;
    imagePlaceholder?: string;
  }

  export function toPng(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  export function toSvg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;
  export function toPixelData(node: HTMLElement, options?: DomToImageOptions): Promise<Uint8ClampedArray>;
  export function toBlob(node: HTMLElement, options?: DomToImageOptions): Promise<Blob>;
}
