import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Client Supabase côté serveur (SSR, cookies) — **point d’entrée unique** pour les pages
 * qui lisent la base (Academy, calendrier, planning, etc.) avec la clé **anon**.
 * Les politiques RLS déterminent ce qui est visible ; ces lectures ne passent pas par
 * `auth.getUser()` et ne sont pas bloquées par le middleware pour les routes publiques.
 */
export async function createClient() {
  return createSupabaseServerClient();
}
