import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export const runtime = "nodejs"; // garante Node runtime

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: NextRequest) {
  try {
    const { contentType, fileName, folder } = await req.json();

    if (!contentType || !fileName) {
      return NextResponse.json({ error: "contentType e fileName são obrigatórios" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
    }

    const bucket = process.env.S3_BUCKET_NAME!;
    const ext = (fileName.split(".").pop() || "").toLowerCase() || "bin";

    // Dica multi-tenant: prefixe por writerId/tenant se quiser
    const prefix = folder
      ? folder.replace(/^\/+|\/+$/g, "") + "/"
      : "";

    const key = `${prefix}${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      // Se o bucket usa ACL e você quer deixar o objeto público via ACL (NÃO recomendado se ACLs estão bloqueadas):
      // ACL: "public-read",
      // Metadados úteis (opcional)
      Metadata: {
        uploadedBy: "nextjs-app",
      },
    });

    // URL válida por 60s (ajuste se precisar)
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({
      url,
      key,
      publicUrl: `${process.env.S3_PUBLIC_URL}/${key}`,
      expiresIn: 60,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao gerar URL" }, { status: 500 });
  }
}
