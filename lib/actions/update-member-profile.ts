"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_TALENTS = new Set([
  "musique_piano",
  "academie",
  "technique_it",
  "organisation",
  "ecoute_benevole",
]);

const UUID_RE = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export type UpdateMemberProfileState = { status: "idle" } | { status: "success" } | { status: "error"; message: string };

export async function updateMemberProfileAction(
  _prev: UpdateMemberProfileState,
  formData: FormData,
): Promise<UpdateMemberProfileState> {
  const targetId = clean(formData.get("profile_id"));
  if (!UUID_RE.test(targetId)) {
    return { status: "error", message: "invalid_fields" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.warn("[AGAPE Profil édition] Utilisateur non connecté.");
    return { status: "error", message: "unauthorized" };
  }

  if (user.id !== targetId) {
    const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (me?.role !== "super-admin") {
      console.warn("[AGAPE Profil édition] Accès refusé :", user.id, "≠", targetId);
      return { status: "error", message: "forbidden" };
    }
  }

  const lastName = clean(formData.get("last_name"));
  const firstName = clean(formData.get("first_name"));
  const talentEntries = formData.getAll("talents").map(String).map((t) => t.trim());
  const talents = [...new Set(talentEntries)].filter((t) => ALLOWED_TALENTS.has(t));

  if (!firstName || firstName.length > 120 || !lastName || lastName.length > 120) {
    return { status: "error", message: "invalid_fields" };
  }
  if (talents.length === 0) {
    return { status: "error", message: "invalid_talents" };
  }

  const fullName = `${firstName} ${lastName}`.trim();

  const { error: pErr } = await supabase
    .from("profiles")
    .update({
      first_names: firstName,
      last_name: lastName,
      full_name: fullName,
      talents,
      member_talents: talents,
    })
    .eq("id", targetId);

  if (pErr) {
    console.error("[AGAPE Profil édition] Échec mise à jour `profiles` :", pErr.message);
    return { status: "error", message: "db_error" };
  }

  console.log("[AGAPE Profil édition] Enregistrement réussi pour le profil", targetId);

  return { status: "success" };
}
