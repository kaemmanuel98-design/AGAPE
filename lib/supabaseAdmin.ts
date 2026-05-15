import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error("❌ ERREUR CRITIQUE : La SUPABASE_SERVICE_ROLE_KEY est manquante dans le .env");
} else {
  console.log("✅ La clé de service est bien chargée.");
}

/**
 * Client Supabase **admin** (clé `SUPABASE_SERVICE_ROLE_KEY`).
 * Réservé au serveur : upload Storage avant auth, création de compte (`auth.admin`), etc.
 * Ne jamais exposer cette clé au navigateur.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url || !serviceKey) {
    throw new Error(
      "[AGAPE Supabase] SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL manquant — requis pour l’inscription (avatar + compte).",
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
