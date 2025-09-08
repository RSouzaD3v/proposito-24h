import { NextRequest } from "next/server";

export const runtime = "nodejs"; // importante para streaming estável no servidor
export const dynamic = "force-dynamic";

type Body = {
  text: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: {
    stability?: number;        // 0..1
    similarity_boost?: number; // 0..1
    style?: number;            // 0..1
    use_speaker_boost?: boolean;
  };
};

function getEnv(key: string, fallback?: string) {
  const v = process.env[key];
  if (!v && fallback === undefined) {
    throw new Error(`Missing env var: ${key}`);
  }
  return v ?? fallback!;
}

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, modelId, voiceSettings }: Body = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Texto inválido" }), { status: 400 });
    }

    const apiKey = getEnv("ELEVENLABS_API_KEY");
    const defaultVoice = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // fallback de demo
    const chosenVoice = voiceId || defaultVoice;
    const chosenModel = modelId || process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

    // endpoint “stream” devolve áudio já tocável
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(chosenVoice)}/stream`;

    const elevenRes = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text,
        model_id: chosenModel,
        voice_settings: voiceSettings ?? {
          stability: 0.4,
          similarity_boost: 0.7,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!elevenRes.ok || !elevenRes.body) {
      const errTxt = await elevenRes.text().catch(() => "");
      return new Response(JSON.stringify({ error: "Falha no TTS", details: errTxt }), { status: 500 });
    }

    // repassa o stream de áudio direto para o cliente
    return new Response(elevenRes.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        // CORS básico (se precisar tocar do app RN/WebView, ajuda):
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Erro inesperado" }), { status: 500 });
  }
}

export async function OPTIONS() {
  // CORS preflight
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
}
