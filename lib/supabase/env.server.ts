import fs from "node:fs";
import path from "node:path";

import { loadEnvConfig } from "@next/env";

const ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
] as const;

type EnvKey = (typeof ENV_KEYS)[number];

export function findProjectRootForDebug(): string {
  return findProjectRoot();
}

function findProjectRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function parseEnvFile(filePath: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(filePath)) return map;

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq <= 0) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map.set(key, value);
  }
  return map;
}

/** Lit une variable depuis `.env.local` / `.env` (prioritaire sur `process.env` pour les Server Actions). */
export function readProjectEnv(name: EnvKey): string | undefined {
  const roots = [...new Set([findProjectRoot(), process.cwd()])];

  for (const root of roots) {
    for (const filename of [".env.local", ".env"] as const) {
      const fromFile = parseEnvFile(path.join(root, filename)).get(name)?.trim();
      if (fromFile) {
        process.env[name] = fromFile;
        return fromFile;
      }
    }
  }

  // Notation bracket : évite l’inlining webpack/Turbopack `process.env.SUPABASE_*` → undefined
  const fromProcess = process.env[name]?.trim();
  return fromProcess || undefined;
}

export function ensureSupabaseEnvLoaded(): void {
  const roots = [...new Set([findProjectRoot(), process.cwd()])];
  for (const root of roots) {
    loadEnvConfig(root);
  }
  for (const key of ENV_KEYS) {
    readProjectEnv(key);
  }
}

export function getSupabasePublicEnv(): { url: string | null; anonKey: string | null } {
  ensureSupabaseEnvLoaded();
  return {
    url: readProjectEnv("NEXT_PUBLIC_SUPABASE_URL") ?? null,
    anonKey: readProjectEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? null,
  };
}

export function getSupabaseServiceRoleKey(): string | null {
  ensureSupabaseEnvLoaded();
  return readProjectEnv("SUPABASE_SERVICE_ROLE_KEY") ?? null;
}

export function isSupabaseAdminConfigured(): boolean {
  const url = readProjectEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = readProjectEnv("SUPABASE_SERVICE_ROLE_KEY");
  return Boolean(url && serviceKey);
}

export function requireSupabaseAdminEnv(): { url: string; serviceKey: string } {
  ensureSupabaseEnvLoaded();

  const url = readProjectEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = readProjectEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    console.error("[AGAPE Supabase] requireSupabaseAdminEnv échoué :", {
      cwd: process.cwd(),
      projectRoot: findProjectRoot(),
      hasEnvLocal: fs.existsSync(path.join(findProjectRoot(), ".env.local")),
      hasUrl: Boolean(url),
      hasServiceKey: Boolean(serviceKey),
      serviceKeyLength: serviceKey?.length ?? 0,
    });
    throw new Error(
      "[AGAPE Supabase] SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL manquant — vérifiez .env.local puis redémarrez `npm run dev`.",
    );
  }

  return { url, serviceKey };
}
