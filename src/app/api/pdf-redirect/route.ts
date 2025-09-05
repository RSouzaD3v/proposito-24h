// app/api/pdf-redirect/route.ts
import { NextRequest, NextResponse } from "next/server";

// ✅ Liste aqui os hosts de origem dos seus PDFs (S3/CloudFront)
const ALLOWED_HOSTS = new Set<string>([
  "proposito24h-bucket.s3.us-east-1.amazonaws.com",
  // "cdn.proposito24h.com.br", // se usar CloudFront, adicione
]);

export const runtime = "edge"; // leve e rápido
export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) return NextResponse.json({ error: "Missing ?u" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(u);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (ALLOWED_HOSTS.size && !ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "Forbidden host" }, { status: 403 });
  }

  // 302 para a URL do PDF → navegador/OS assume o viewer nativo (Chrome/iOS Quick Look)
  return NextResponse.redirect(target.toString(), 302);
}
