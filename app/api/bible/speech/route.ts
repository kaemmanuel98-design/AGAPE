import { NextResponse } from "next/server";

import {
  ELEVENLABS_NARRATOR_VOICE_SETTINGS,
  elevenLabsModelId,
} from "@/lib/bible/elevenlabs-tts";
import { isCustomNarratorConfigured } from "@/lib/bible/narrator-voice-server";

export async function GET() {
  return NextResponse.json({
    configured: isCustomNarratorConfigured(),
    hasSample: true,
  });
}

type Body = {
  text?: string;
  language?: string;
  /** Contexte textuel pour l’enchaînement (versets adjacents). */
  previous_text?: string;
  next_text?: string;
  /** Jusqu’à 3 IDs de requêtes ElevenLabs déjà générées (request stitching). */
  previous_request_ids?: string[];
};

/**
 * Synthèse vocale avec la voix clonée ElevenLabs (ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID).
 * Un segment court par requête (ex. un verset) pour garder un volume et un timbre stables.
 */
export async function POST(request: Request) {
  if (!isCustomNarratorConfigured()) {
    return NextResponse.json(
      { error: "custom_voice_not_configured" },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text || text.length > 4_000) {
    return NextResponse.json({ error: "invalid_text" }, { status: 400 });
  }

  const previousText = body.previous_text?.trim();
  const nextText = body.next_text?.trim();
  const previousRequestIds = Array.isArray(body.previous_request_ids)
    ? body.previous_request_ids.filter((id): id is string => typeof id === "string" && id.length > 0).slice(-3)
    : [];

  const { getElevenLabsApiKey, getNarratorVoiceId } = await import("@/lib/bible/narrator-voice");
  const apiKey = getElevenLabsApiKey()!;
  const voiceId = getNarratorVoiceId()!;
  const modelId = elevenLabsModelId();

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: ELEVENLABS_NARRATOR_VOICE_SETTINGS,
      ...(previousText ? { previous_text: previousText } : {}),
      ...(nextText ? { next_text: nextText } : {}),
      ...(previousRequestIds.length > 0 ? { previous_request_ids: previousRequestIds } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[AGAPE Bible speech]", res.status, detail.slice(0, 500));
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  }

  const requestId = res.headers.get("request-id")?.trim() ?? "";
  const audio = await res.arrayBuffer();
  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=3600",
      ...(requestId ? { "X-Request-Id": requestId } : {}),
    },
  });
}
