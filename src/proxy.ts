import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

const isApiPath = (pathname: string) => pathname.startsWith("/api/v1/");

export default withAuth(
  function proxy(req: NextRequest) {
    if (!isApiPath(req.nextUrl.pathname)) return;

    // Todo o tráfego sai dos IPs da hospedagem: a API precisa saber o IP real de cada visitante.
    const headers = new Headers(req.headers);
    headers.delete("x-internal-key");
    headers.set("x-proxy-key", process.env.INTERNAL_API_KEY ?? "");
    headers.set(
      "x-client-ip",
      req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    );
    return NextResponse.next({ request: { headers } });
  },
  {
    callbacks: {
      // A própria API decide o acesso às rotas /api/v1.
      authorized: ({ req, token }) => isApiPath(req.nextUrl.pathname) || !!token,
    },
  },
);

export const config = {
  matcher: [
    "/api/v1/:path*",
    "/admin/:path*",
    "/writer/:path*",
    "/reader/area/:path*",
    "/reader/account",
    "/app/:path*",
    "/redirector",
  ],
};
