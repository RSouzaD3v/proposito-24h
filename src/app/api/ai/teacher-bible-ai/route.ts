// app/api/teacher-bible-ai/route.ts
import { NextResponse } from "next/server";
import { teacherBibleAi } from "@/lib/gemini";

function extractErrorInfo(err: unknown): {
  code?: number;
  status?: string;
  message: string;
} {
  if (!err || typeof err !== "object") {
    return { message: String(err ?? "") };
  }

  const anyErr = err as {
    message?: string;
    status?: string | number;
    code?: number;
    error?: { code?: number; status?: string; message?: string };
  };

  // Google GenAI often puts the full JSON body in `message`
  if (typeof anyErr.message === "string") {
    try {
      const parsed = JSON.parse(anyErr.message);
      const nested = parsed?.error ?? parsed;
      if (nested && typeof nested === "object") {
        return {
          code: nested.code ?? anyErr.code,
          status: nested.status ?? String(anyErr.status ?? ""),
          message: nested.message ?? anyErr.message,
        };
      }
    } catch {
      // not JSON — use as-is
    }
  }

  if (anyErr.error && typeof anyErr.error === "object") {
    return {
      code: anyErr.error.code ?? anyErr.code,
      status: anyErr.error.status,
      message: anyErr.error.message ?? anyErr.message ?? "AI error",
    };
  }

  return {
    code: anyErr.code,
    status: typeof anyErr.status === "string" ? anyErr.status : undefined,
    message: anyErr.message ?? "AI error",
  };
}

function toClientError(err: unknown): { message: string; status: number } {
  const info = extractErrorInfo(err);
  const code = info.code;
  const status = (info.status || "").toUpperCase();
  const raw = `${info.message} ${status}`.toLowerCase();

  if (
    code === 401 ||
    code === 403 ||
    status === "PERMISSION_DENIED" ||
    status === "UNAUTHENTICATED" ||
    raw.includes("api key") ||
    raw.includes("unregistered callers")
  ) {
    return {
      status: 503,
      message:
        "O chat bíblico está temporariamente indisponível. Tente novamente em alguns minutos.",
    };
  }

  if (
    code === 429 ||
    status === "RESOURCE_EXHAUSTED" ||
    raw.includes("quota") ||
    raw.includes("rate limit")
  ) {
    return {
      status: 429,
      message:
        "Muitas perguntas ao mesmo tempo. Aguarde um instante e tente novamente.",
    };
  }

  if (code === 400 || status === "INVALID_ARGUMENT") {
    return {
      status: 400,
      message:
        "Não foi possível entender sua pergunta. Tente reformular e enviar de novo.",
    };
  }

  if (code === 404 || status === "NOT_FOUND") {
    return {
      status: 503,
      message:
        "O chat bíblico está temporariamente indisponível. Tente novamente em alguns minutos.",
    };
  }

  return {
    status: 500,
    message:
      "Não foi possível gerar a explicação agora. Tente novamente em instantes.",
  };
}

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        {
          error:
            "O chat bíblico está temporariamente indisponível. Tente novamente em alguns minutos.",
        },
        { status: 503 }
      );
    }

    const { prompt } = await req.json().catch(() => ({ prompt: "" }));
    const text = await teacherBibleAi(
      prompt && typeof prompt === "string"
        ? prompt
        : "Explain about genesis in a few words"
    );
    return NextResponse.json({ text });
  } catch (err: unknown) {
    const { message, status } = toClientError(err);
    console.error("[teacher-bible-ai]", err);
    return NextResponse.json({ error: message }, { status });
  }
}
