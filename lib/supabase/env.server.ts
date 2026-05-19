import "server-only";

import { loadEnvConfig } from "@next/env";

import {
  getSupabasePublicEnv as getPublicEnv,
  getSupabaseServiceRoleKey as getServiceKey,
} from "@/lib/supabase/env";

let envLoaded = false;

/** Charge `.env.local` dans les Server Actions / Route Handlers (workers Turbopack). */
export function ensureSupabaseEnvLoaded(): void {
  if (envLoaded) return;
  loadEnvConfig(process.cwd());
  envLoaded = true;
}

export function getSupabasePublicEnv() {
  ensureSupabaseEnvLoaded();
  return getPublicEnv();
}

export function getSupabaseServiceRoleKey() {
  ensureSupabaseEnvLoaded();
  return getServiceKey();
}

export function isSupabaseAdminConfigured(): boolean {
  ensureSupabaseEnvLoaded();
  const { url } = getPublicEnv();
  return Boolean(url && getServiceKey());
}

export function requireSupabaseAdminEnv(): { url: string; serviceKey: string } {
  ensureSupabaseEnvLoaded();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    console.error("[AGAPE Supabase] État env admin :", {
      cwd: process.cwd(),
      hasUrl: Boolean(url),
      hasServiceKey: Boolean(serviceKey),
      serviceKeyLength: serviceKey?.length ?? 0,
    });
    throw new Error(
      "[AGAPE Supabase] SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL manquant — copiez .env.example vers .env.local (Dashboard → Settings → API).",
    );
  }

  return { url, serviceKey };
}
