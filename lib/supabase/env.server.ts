import fs from "node:fs";
import path from "node:path";

import { loadEnvConfig } from "@next/env";

const ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
] as const;

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

/** Parse minimal `.env.local` / `.env` si `loadEnvConfig` n’a pas tout injecté (workers Turbopack). */
function loadEnvFileManually(root: string, filename: string): void {
  const filePath = path.join(root, filename);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq <= 0) continue;

    const key = line.slice(0, eq).trim();
    if (!ENV_KEYS.includes(key as (typeof ENV_KEYS)[number])) continue;

    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

/** Charge `.env.local` à la racine du projet (idempotent, réessaie si la clé service manque encore). */
export function ensureSupabaseEnvLoaded(): void {
  const roots = [...new Set([findProjectRoot(), process.cwd()])];

  for (const root of roots) {
    loadEnvConfig(root);
    loadEnvFileManually(root, ".env.local");
    loadEnvFileManually(root, ".env");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    console.error("[AGAPE Supabase] SUPABASE_SERVICE_ROLE_KEY toujours absente après chargement env.", {
      cwd: process.cwd(),
      roots,
      hasEnvLocal: roots.some((r) => fs.existsSync(path.join(r, ".env.local"))),
    });
  }
}

export function getSupabasePublicEnv(): { url: string | null; anonKey: string | null } {
  ensureSupabaseEnvLoaded();
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || null,
  };
}

export function getSupabaseServiceRoleKey(): string | null {
  ensureSupabaseEnvLoaded();
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

export function isSupabaseAdminConfigured(): boolean {
  ensureSupabaseEnvLoaded();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && serviceKey);
}

export function requireSupabaseAdminEnv(): { url: string; serviceKey: string } {
  ensureSupabaseEnvLoaded();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    throw new Error(
      "[AGAPE Supabase] SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL manquant — vérifiez .env.local à la racine du projet puis redémarrez `npm run dev`.",
    );
  }

  return { url, serviceKey };
}
