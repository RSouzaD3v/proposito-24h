import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function middleware(req: NextRequest) {
  const { pathname, host } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protege rotas específicas por papel
  const isAdminRoute = pathname.startsWith("/admin");
  const isWriterRoute = pathname.startsWith("/writer");
  const isAppRoute = pathname.startsWith("/app");

  if (isAdminRoute) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (isWriterRoute) {
    if (!token || token.role !== "WRITER_ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (isAppRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // (Opcional) Detecta writerId baseado no host (subdomínio ou domínio personalizado)
  // Adiciona no header para uso em APIs
  if (!req.headers.get("x-writer-id")) {
    const currentHost = host.split(":")[0];

    // 1. Tenta encontrar por domínio personalizado (ex: dominiocliente.com)
    const domain = await db.domain.findUnique({
      where: { host: currentHost },
    });

    if (domain) {
      const response = NextResponse.next();
      response.headers.set("x-writer-id", domain.writerId);
      return response;
    }

    // 2. Tenta encontrar por subdomínio (ex: igreja1.seuplataforma.com)
    const parts = currentHost.split(".");
    if (parts.length > 2) {
      const subdomain = parts[0];
      const writer = await db.writer.findUnique({
        where: { slug: subdomain },
      });
      if (writer) {
        const response = NextResponse.next();
        response.headers.set("x-writer-id", writer.id);
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/writer/:path*",
    "/app/:path*",
    "/api/:path*",
    "/redirector", // adicionar aqui
  ],
  runtime: "nodejs", // <- ESSENCIAL PARA FUNCIONAR COM PRISMA
};
