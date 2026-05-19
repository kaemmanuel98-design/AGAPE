import { readFileSync } from "node:fs";
import path from "node:path";

type VoiceConfig = {
  voiceId?: string;
};

let cachedVoiceId: string | null | undefined;

function readVoiceIdFromFile(): string | null {
  try {
    const filePath = path.join(process.cwd(), "public", "audio", "bible", "voice.json");
    const raw = readFileSync(filePath, "utf8");
    const data = JSON.parse(raw) as VoiceConfig;
    return data.voiceId?.trim() || null;
  } catch {
    return null;
  }
}

export function getNarratorVoiceId(): string | null {
  if (cachedVoiceId !== undefined) return cachedVoiceId;
  const fromEnv = process.env.ELEVENLABS_VOICE_ID?.trim();
  cachedVoiceId = fromEnv || readVoiceIdFromFile();
  return cachedVoiceId;
}

export function getElevenLabsApiKey(): string | null {
  return process.env.ELEVENLABS_API_KEY?.trim() || null;
}

export function isCustomNarratorConfigured(): boolean {
  return Boolean(getElevenLabsApiKey() && getNarratorVoiceId());
}
