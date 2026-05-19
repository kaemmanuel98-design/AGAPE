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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = `test-${Date.now()}@members.agape`;
const { data, error } = await admin.auth.admin.createUser({
  email,
  password: "TestPass123!Aa",
  email_confirm: true,
  user_metadata: {
    full_name: "Test User",
    avatar_url: "",
    current_need: "soutien_moral",
    city: "Paris",
  },
});

if (error) {
  console.log("CREATE_ERROR", error.message, error.code, error.status);
  process.exit(1);
}

console.log("OK", data.user?.id);
if (data.user?.id) {
  await admin.auth.admin.deleteUser(data.user.id);
}
