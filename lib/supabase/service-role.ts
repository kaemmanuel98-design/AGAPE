import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

/**
 * Alias historique : même client que `createSupabaseAdminClient` (`SUPABASE_SERVICE_ROLE_KEY`).
 * Lecture profil public, etc.
 */
export function createSupabaseServiceRoleClient(): SupabaseClient {
  return createSupabaseAdminClient();
}
