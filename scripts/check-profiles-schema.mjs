import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

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

const env = parseEnvLocal(path.join(process.cwd(), ".env.local"));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const cols = [
  "first_names",
  "first_name",
  "last_name",
  "phone",
  "member_talents",
  "talents",
  "full_name",
  "current_need",
  "city",
  "preferred_language",
  "message",
  "avatar_url",
  "email",
];

for (const col of cols) {
  const { error } = await admin.from("profiles").select(col).limit(1);
  console.log(col, error ? `MISSING: ${error.message}` : "OK");
}
