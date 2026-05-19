/**
 * Charge `.env.local` dès le démarrage du runtime Node (Server Actions, routes API, etc.).
 * Évite que les workers Turbopack n’aient pas `SUPABASE_SERVICE_ROLE_KEY`.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureSupabaseEnvLoaded } = await import("@/lib/supabase/env.server");
    ensureSupabaseEnvLoaded();
  }
}
