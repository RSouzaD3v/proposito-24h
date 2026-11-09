import { ImageResponse } from "next/og";
import { apiPublicGet } from "@/lib/api/server";
import { contentSummary, type WriterProfileData } from "../_lib/directory";

export const alt = "Escritor na DevotionalApp";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** O gerador só aceita PNG e JPEG; qualquer outra imagem cai no visual sem foto. */
async function toDataUri(url: string | null) {
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(png|jpe?g)/.test(type)) return null;
    return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const slug = encodeURIComponent(decodeURIComponent((await params).slug));
  const writer = await apiPublicGet<WriterProfileData>(`/public/directory/writers/${slug}`, 300);
  const name = writer?.name.trim() ?? "DevotionalApp";
  const summary = writer ? contentSummary(writer) : "";
  const logo = await toDataUri(writer?.logoUrl ?? null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 72,
          color: "white",
          background: "linear-gradient(135deg, #0d1230 0%, #1f2b5c 60%, #7a5a2a 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          {logo ? (
            <img src={logo} alt="" width={132} height={132} style={{ borderRadius: 28, objectFit: "contain", background: "white" }} />
          ) : (
            <div
              style={{
                width: 132,
                height: 132,
                borderRadius: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                background: "rgba(255,255,255,0.16)",
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: "flex", marginTop: 36, fontSize: name.length > 26 ? 56 : 72, fontWeight: 700, lineHeight: 1.1 }}>
            {name}
          </div>
          {summary && <div style={{ display: "flex", marginTop: 16, fontSize: 32, color: "rgba(255,255,255,0.85)" }}>{summary}</div>}
          <div style={{ display: "flex", marginTop: 32, fontSize: 26, color: "#dcb36a", fontWeight: 700 }}>
            Conheça na DevotionalApp
          </div>
        </div>
      </div>
    ),
    { ...size, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
