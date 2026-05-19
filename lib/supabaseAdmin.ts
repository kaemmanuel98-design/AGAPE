import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAdminEnv } from "@/lib/supabase/env.server";

/**
 * Client Supabase **admin** (clé `SUPABASE_SERVICE_ROLE_KEY`).
 * Réservé au serveur : upload Storage avant auth, création de compte (`auth.admin`), etc.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const { url, serviceKey } = requireSupabaseAdminEnv();

  if (process.env.NODE_ENV === "development") {
    console.log("[AGAPE Supabase] Client admin prêt (service role, longueur clé :", serviceKey.length, ").");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
