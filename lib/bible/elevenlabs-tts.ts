/** Réglages ElevenLabs pour une voix stable sur des segments courts (verset par verset). */
export const ELEVENLABS_NARRATOR_VOICE_SETTINGS = {
  stability: 0.85,
  similarity_boost: 0.85,
  style: 0,
  use_speaker_boost: true,
} as const;

export function elevenLabsModelId(): string {
  return process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";
}
