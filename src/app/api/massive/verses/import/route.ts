import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";
import crypto from "crypto";
import { verseQueue } from "@/lib/queue";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";
import { db } from "@/lib/db";
import { write } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RowSchema = z.object({
  writerId: z.string().min(1).optional(),
  content: z.string().min(1),
  reference: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")).transform(v => v || undefined),
createdAt: z.union([z.string(), z.number(), z.date()]).optional().transform((v) => {
    if (!v) return undefined;

    if (v instanceof Date) return v;

    if (typeof v === "number") {
      // epoch ms?
      if (v > 1e10) return new Date(v);
      // serial Excel (dias desde 1899-12-30, UTC)
      const base = new Date(Date.UTC(1899, 11, 30));
      return new Date(base.getTime() + v * 86400000);
    }

    if (typeof v === "string") {
      const raw = v.trim();
      // dd/MM/yyyy
      const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m) {
        const [, dd, mm, yyyy] = m;
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      }
      const dt = new Date(raw); // tenta ISO
      return isNaN(dt.getTime()) ? undefined : dt;
    }

    return undefined;
  }),
});

type RowInput = z.infer<typeof RowSchema>;

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);    
    if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const userWriter = await db.user.findUnique({
        where: {
            id: session.user.id
        }
    }); 
    if (!userWriter || !userWriter.writerId) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

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

    const valid: RowInput[] = [];
    const errors: Array<{ line: number; error: string }> = [];

    rows.forEach((r, i) => {
      try {
        const parsed = RowSchema.parse({
          content: r.content ?? r.conteudo ?? r.texto,
          reference: r.reference ?? r.referencia ?? r.verso,
          imageUrl: r.imageUrl ?? r.imagem ?? r.image,
        });
        valid.push({...parsed, writerId: userWriter.writerId as string});
      } catch (e: any) {
        errors.push({ line: i + 2, error: e.message });
      }
    });

    const jobs = await Promise.all(
      valid.map((data) => {
        // const key = crypto.createHash("sha1").update(`${userWriter.writerId}|${data.reference}`).digest("hex");
        return verseQueue.add("create-verse", data);
      })
    );

    return NextResponse.json({ totalRows: rows.length, enqueued: jobs.length, errors, sample: valid.slice(0,3) });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Falha no import", message: err.message }, { status: 500 });
  }
}
