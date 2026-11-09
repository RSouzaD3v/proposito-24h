import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O navegador fala com a API pelo mesmo domínio, para o cookie de sessão acompanhar a chamada.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${process.env.API_URL}/v1/:path*` }];
  },
};

export default nextConfig;
