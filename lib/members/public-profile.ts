import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

/** Champs exposés sur la page profil publique (pas de téléphone ni message d’accompagnement). */
export type MemberPublicProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  talents: unknown;
  avatar_url: string | null;
};

const UUID_RE = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

/**
 * Charge une inscription membre par identifiant pour la page `/profile/[id]`.
 * Utilise la clé **service_role** : la RLS ne permet pas aux anonymes de lister ou lire la table.
 */
export async function getMemberPublicProfileById(id: string): Promise<MemberPublicProfile | null> {
  if (!UUID_RE.test(id)) return null;

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("members_registration")
      .select("id,first_name,last_name,talents,avatar_url")
      .eq("id", id)
      .eq("archived", false)
      .maybeSingle();

    if (error) {
      console.error("[AGAPE Profil membre] Lecture Supabase :", error.message);
      return null;
    }
    if (!data) return null;
    return data as MemberPublicProfile;
  } catch (e) {
    console.error("[AGAPE Profil membre] Clé service ou requête indisponible :", e);
    return null;
  }
}
