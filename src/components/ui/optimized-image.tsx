import Image from "next/image";

/** Deve acompanhar `images.remotePatterns` em next.config.ts. */
const OPTIMIZED_HOST = "proposito24h-bucket.s3.us-east-1.amazonaws.com";

function canOptimize(src: string) {
  if (src.startsWith("/")) return !src.startsWith("//");
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.host === OPTIMIZED_HOST;
  } catch {
    return false;
  }
}

type OptimizedImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  title?: string;
};

/** Entrega a imagem no tamanho exibido; endereços fora do bucket seguem como estão, sem quebrar a página. */
export function OptimizedImage({ src, alt, width, height, className, title }: OptimizedImageProps) {
  if (canOptimize(src)) {
    return <Image src={src} alt={alt} width={width} height={height} className={className} title={title} />;
  }
  return <img src={src} alt={alt} width={width} height={height} className={className} title={title} loading="lazy" />;
}
