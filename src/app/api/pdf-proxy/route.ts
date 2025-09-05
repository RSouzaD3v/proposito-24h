// app/api/pdf-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

// ⚠️ Ajuste/adicione hosts permitidos (S3 ou CloudFront) se necessário
const ALLOWED_HOSTS = new Set<string>([
  "proposito24h.s3.us-east-2.amazonaws.com",
  // "cdn.seu-dominio.com.br",
]);

export const runtime = "nodejs";        // streaming estável
export const dynamic = "force-dynamic"; // evita cache de SSR

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) {
    return NextResponse.json({ error: "Missing ?u" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(u);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (ALLOWED_HOSTS.size && !ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "Forbidden host" }, { status: 403 });
  }

  // Encaminhar cabeçalhos relevantes (Range e condicionais p/ cache)
  const fwdHeaders = new Headers();
  const range = req.headers.get("range");
  if (range) fwdHeaders.set("Range", range);

  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch) fwdHeaders.set("If-None-Match", ifNoneMatch);

  const ifModifiedSince = req.headers.get("if-modified-since");
  if (ifModifiedSince) fwdHeaders.set("If-Modified-Since", ifModifiedSince);

  // Busca no S3/CF com passthrough de headers
  const upstream = await fetch(target.toString(), {
    headers: fwdHeaders,
  });

  // Copia corpo como stream
  const body = upstream.body;

  // Copia cabeçalhos úteis pro browser manter cache/stream
  const upstreamHeaders = upstream.headers;
  const out = new Headers();
  const COPY = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "etag",
    "last-modified",
    "cache-control",
    "expires",
  ];
  for (const h of COPY) {
    const v = upstreamHeaders.get(h);
    if (v) out.set(h, v);
  }
  if (!out.has("content-type")) out.set("content-type", "application/pdf");

  return new NextResponse(body, {
    status: upstream.status, // 200/206/304 conforme upstream
    headers: out,
  });
}
