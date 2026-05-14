import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la **clé service_role** : contourne la RLS.
 * À n’utiliser que dans du code **serveur** (Server Actions, Route Handlers, Server Components),
 * jamais exposée au navigateur (ne pas préfixer par `NEXT_PUBLIC_`).
 *
 * Cas d’usage AGAPE : upload Storage `avatars` et lecture d’une fiche membre par UUID pour `/profile/[id]`.
 */
export function createSupabaseServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "[AGAPE Supabase] SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL manquant — requis pour l’espace membre (avatar + page profil).",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
