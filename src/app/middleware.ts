import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    // Middleware custom, se quiser logs ou validações adicionais
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next|static|login).*)"],
};