import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";
import crypto from "crypto";
import { prayerQueue } from "@/lib/queue";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RowSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")).transform(v => v || undefined),
  createdAt: z.union([z.string(), z.number(), z.date()]).optional().transform((v) => {
    if (!v) return undefined;
    if (v instanceof Date) return v;
    if (typeof v === "number") {
      if (v > 1e10) return new Date(v); // epoch ms
      const base = new Date(Date.UTC(1899, 11, 30)); // Excel serial
      return new Date(base.getTime() + v * 86400000);
    }
    if (typeof v === "string") {
      const raw = v.trim();
      const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); // dd/MM/yyyy
      if (m) {
        const [, dd, mm, yyyy] = m;
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      }
      const dt = new Date(raw); // ISO fallback
      return isNaN(dt.getTime()) ? undefined : dt;
    }
    return undefined;
  }),
});

type RowInput = z.infer<typeof RowSchema>;
type PrayerJob = RowInput & { writerId: string };

export async function POST(req: NextRequest) {
  // auth + writer
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.writerId) return NextResponse.json({ error: "Usuário sem writerId." }, { status: 400 });

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Envie 'file' (.xls/.xlsx)." }, { status: 400 });

    const ab = await file.arrayBuffer();
    const wb = XLSX.read(new Uint8Array(ab), { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) return NextResponse.json({ error: "Planilha vazia." }, { status: 400 });

    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { raw: false, defval: "" });
    if (rows.length === 0) return NextResponse.json({ error: "Nenhuma linha encontrada." }, { status: 400 });

    const valid: PrayerJob[] = [];
    const errors: Array<{ line: number; error: string }> = [];

    rows.forEach((r, i) => {
      try {
        const parsed = RowSchema.parse({
          title: r.title ?? r.titulo ?? r.Title,
          content: r.content ?? r.conteudo ?? r.texto,
          imageUrl: r.imageUrl ?? r.imagem ?? r.cover,
          createdAt: r.createdAt ?? r.data ?? r.date ?? r["created_at"] ?? r["Created At"],
        });
        valid.push({ ...parsed, writerId: user.writerId as string });
      } catch (e: any) {
        errors.push({ line: i + 2, error: e.message });
      }
    });

    const jobs = await Promise.all(
      valid.map((data) => {
        // jobId opcional; se reimportar com o mesmo título, evita duplicar job
        // const key = crypto.createHash("sha1").update(`${data.writerId}|${data.title}`).digest("hex");
        return prayerQueue.add("create-prayer", data);
      })
    );

    return NextResponse.json({
      totalRows: rows.length,
      enqueued: jobs.length,
      errors,
      sample: valid.slice(0, 3),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Falha no import", message: err.message }, { status: 500 });
  }
}
