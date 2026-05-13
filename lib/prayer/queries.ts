import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { AdminAssistanceRequestRow, PrayerRequestRow } from "./types";

const PRAYER_REQUEST_SELECT =
  "id,sender_name,message,is_anonymous,requester_user_id,category,phone_contact,assistance_type,contact,assistance_status,internal_notes,source,created_at";

const ADMIN_ASSISTANCE_SELECT =
  "id,sender_name,message,is_anonymous,requester_user_id,category,phone_contact,assistance_type,contact,assistance_status,internal_notes,source,created_at,requester_profile:profiles!prayer_requests_requester_user_id_fkey(first_names,last_name)";

export async function listPrayerRequests(): Promise<PrayerRequestRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("prayer_requests")
    .select(PRAYER_REQUEST_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listPrayerRequests", error);
    return [];
  }

  return (data ?? []) as PrayerRequestRow[];
}

function priorityWeight(value: AdminAssistanceRequestRow) {
  if (value.category === "urgence_vitale") return 0;
  if (value.assistance_status === "en_attente") return 1;
  if (value.assistance_status === "en_cours") return 2;
  return 3;
}

/**
 * PostgREST peut renvoyer la relation `requester_profile` comme un tableau (cardinalité ambiguë côté types générés).
 * On normalise en un seul objet ou `null` pour respecter `AdminAssistanceRequestRow` et passer le `tsc` du build Vercel.
 */
function normalizeAdminAssistanceRow(raw: unknown): AdminAssistanceRequestRow {
  const row = raw as Record<string, unknown>;
  const rp = row.requester_profile;
  let requester_profile: AdminAssistanceRequestRow["requester_profile"] = null;

  if (Array.isArray(rp)) {
    const first = rp[0] as { first_names?: string | null; last_name?: string | null } | undefined;
    requester_profile = first
      ? { first_names: first.first_names ?? null, last_name: first.last_name ?? null }
      : null;
  } else if (rp && typeof rp === "object") {
    const o = rp as { first_names?: string | null; last_name?: string | null };
    requester_profile = { first_names: o.first_names ?? null, last_name: o.last_name ?? null };
  }

  return { ...(row as Omit<AdminAssistanceRequestRow, "requester_profile">), requester_profile };
}

export async function listAdminAssistanceRequests(): Promise<AdminAssistanceRequestRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("prayer_requests")
    .select(ADMIN_ASSISTANCE_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listAdminAssistanceRequests", error);
    return [];
  }

  return ((data ?? []) as unknown[]).map(normalizeAdminAssistanceRow).sort((a, b) => {
    const weightDiff = priorityWeight(a) - priorityWeight(b);
    if (weightDiff !== 0) return weightDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
