/**
 * Lecture des variables Supabase (compatible Edge / middleware).
 * En dev, Next injecte déjà `NEXT_PUBLIC_*` ; la clé service_role n’est lue que côté Node.
 */

export function getSupabasePublicEnv(): { url: string | null; anonKey: string | null } {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || null,
  };
}

export function getSupabaseServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabasePublicEnv();
  return Boolean(url && anonKey);
}

export function isSupabaseAdminConfigured(): boolean {
  const { url } = getSupabasePublicEnv();
  return Boolean(url && getSupabaseServiceRoleKey());
}
