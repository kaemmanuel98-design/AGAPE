/**
 * Supprime les versions bibliques en doublon (kjv-strong, échantillons, etc.).
 * Usage : node scripts/bible-cleanup-versions.mjs
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const DEPRECATED = ["kjv-strong", "sample", "demo", "exemple"];

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
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

for (const slug of DEPRECATED) {
  const { data: version } = await admin.from("bible_versions").select("id").eq("slug", slug).maybeSingle();
  if (!version?.id) {
    console.log(`  ${slug} : absent`);
    continue;
  }
  const { error } = await admin.from("bible_versions").delete().eq("id", version.id);
  if (error) console.error(`  ${slug} :`, error.message);
  else console.log(`  ${slug} : supprimé`);
}

console.log("Nettoyage terminé. Versions actives : lsg, kjv");
