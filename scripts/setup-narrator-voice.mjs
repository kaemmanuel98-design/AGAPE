/**
 * Crée une voix ElevenLabs à partir de public/audio/bible/narrator-reference.ogg
 * et enregistre l’ID dans public/audio/bible/voice.json
 *
 * Prérequis : ELEVENLABS_API_KEY dans .env.local
 * Usage : npm run bible:setup-voice
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SAMPLE = path.join(ROOT, "public", "audio", "bible", "narrator-reference.ogg");
const VOICE_JSON = path.join(ROOT, "public", "audio", "bible", "voice.json");

function parseEnvLocal(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = parseEnvLocal(path.join(ROOT, ".env.local"));
const apiKey = env.ELEVENLABS_API_KEY?.trim();

if (!apiKey) {
  console.error(
    "Ajoutez ELEVENLABS_API_KEY dans .env.local (clé gratuite sur https://elevenlabs.io)",
  );
  process.exit(1);
}

const sample = readFileSync(SAMPLE);
const form = new FormData();
form.append("name", "AGAPE Bible Narrateur");
form.append("description", "Voix WhatsApp — lecture biblique AGAPE");
form.append(
  "files",
  new Blob([sample], { type: "audio/ogg" }),
  "narrator-reference.ogg",
);
form.append("remove_background_noise", "true");

console.log("Envoi de l’échantillon vocal vers ElevenLabs…");

const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
  method: "POST",
  headers: { "xi-api-key": apiKey },
  body: form,
});

if (!res.ok) {
  const errText = await res.text();
  console.error("Échec ElevenLabs :", res.status, errText);
  if (errText.includes("missing_permissions")) {
    console.error(`
→ Créez une nouvelle clé API sur https://elevenlabs.io/app/settings/api-keys
  avec au minimum : text_to_speech, voices_read, create_instant_voice_clone
  (ou une clé « unrestricted »), puis mettez-la à jour dans .env.local.`);
  }
  process.exit(1);
}

const data = await res.json();
const voiceId = data.voice_id;
if (!voiceId) {
  console.error("Réponse inattendue :", data);
  process.exit(1);
}

writeFileSync(
  VOICE_JSON,
  JSON.stringify(
    {
      voiceId,
      source: "public/audio/bible/narrator-reference.ogg",
      createdAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);

console.log("\nVoix créée avec succès.");
console.log("voice_id :", voiceId);
console.log("\nAjoutez dans .env.local :");
console.log(`ELEVENLABS_VOICE_ID=${voiceId}`);
console.log("\nEt sur Vercel (Production) les mêmes variables.");
console.log("Fichier enregistré : public/audio/bible/voice.json");
