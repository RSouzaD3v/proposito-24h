import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    // pode adicionar logs/debug se quiser
    return;
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        // 🔓 Libera o webhook do Stripe sem exigir token
        if (pathname.startsWith("/api/stripe/webhook")) {
          return true;
        }

        // 🔒 Demais rotas continuam exigindo token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/writer/:path*",
    "/reader/area/:path*",
    "/app/:path*",
    // "/api/:path*", // mantém as rotas API, mas o webhook tem exceção no callback
    "/redirector",
  ],
};
