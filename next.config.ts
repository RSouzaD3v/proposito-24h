import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "proposito24h-bucket.s3.us-east-1.amazonaws.com" }],
    // Cada envio gera um endereço novo, então a versão otimizada pode ficar em cache por 30 dias.
    minimumCacheTTL: 2_592_000,
  },
  // O navegador fala com a API pelo mesmo domínio, para o cookie de sessão acompanhar a chamada.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${process.env.API_URL}/v1/:path*` }];
  },
};

export default nextConfig;
