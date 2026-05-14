import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

/** Données exposées sur `/profile/[id]` (lecture service_role pour visiteurs non connectés). */
export type MemberPublicProfile = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  talents: unknown;
  avatar_url: string | null;
  current_need: string | null;
  message: string | null;
};

const UUID_RE = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

type ProfilePublicRow = {
  id: string;
  full_name: string | null;
  first_names: string | null;
  last_name: string | null;
  talents: string[] | null;
  member_talents: unknown;
  avatar_url: string | null;
  current_need: string | null;
  message: string | null;
};

function talentsFromRow(row: ProfilePublicRow): unknown {
  if (Array.isArray(row.talents) && row.talents.length > 0) return row.talents;
  return row.member_talents;
}

function mapProfileRow(row: ProfilePublicRow): MemberPublicProfile {
  return {
    id: row.id,
    full_name: row.full_name,
    first_name: row.first_names,
    last_name: row.last_name,
    talents: talentsFromRow(row),
    avatar_url: row.avatar_url,
    current_need: row.current_need,
    message: row.message,
  };
}

/**
 * Charge l’espace membre public : d’abord `profiles`,
 * sinon ancienne fiche `members_registration` (identifiant historique sans Auth).
 */
export async function getMemberPublicProfileById(id: string): Promise<MemberPublicProfile | null> {
  if (!UUID_RE.test(id)) return null;

  try {
    const supabase = createSupabaseServiceRoleClient();

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id,full_name,first_names,last_name,talents,member_talents,avatar_url,current_need,message")
      .eq("id", id)
      .maybeSingle();

    if (pErr) {
      console.error("[AGAPE Profil public] Lecture profiles :", pErr.message);
    }
    if (profile) {
      return mapProfileRow(profile as ProfilePublicRow);
    }

    const { data: reg, error: rErr } = await supabase
      .from("members_registration")
      .select("id,first_name,last_name,full_name,talents,avatar_url,accompaniment_need,support_message")
      .eq("id", id)
      .eq("archived", false)
      .maybeSingle();

    if (rErr) {
      console.error("[AGAPE Profil public] Lecture inscription (fallback) :", rErr.message);
      return null;
    }
    if (!reg) return null;

    return {
      id: reg.id as string,
      full_name: (reg.full_name as string | null) ?? null,
      first_name: reg.first_name as string | null,
      last_name: reg.last_name as string | null,
      talents: reg.talents,
      avatar_url: reg.avatar_url as string | null,
      current_need: (reg as { accompaniment_need?: string | null }).accompaniment_need ?? null,
      message: (reg as { support_message?: string | null }).support_message ?? null,
    };
  } catch (e) {
    console.error("[AGAPE Profil public] Clé service ou requête indisponible :", e);
    return null;
  }
}
