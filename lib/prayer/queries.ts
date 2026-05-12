import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { AdminAssistanceRequestRow, PrayerRequestRow } from "./types";

const PRAYER_REQUEST_SELECT =
  "id,sender_name,message,is_anonymous,requester_user_id,assistance_type,contact,assistance_status,internal_notes,source,created_at";

const ADMIN_ASSISTANCE_SELECT =
  "id,sender_name,message,is_anonymous,requester_user_id,assistance_type,contact,assistance_status,internal_notes,source,created_at,requester_profile:profiles!prayer_requests_requester_user_id_fkey(first_names,last_name)";

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
  if (value.assistance_type === "urgence_vitale") return 0;
  if (value.assistance_status === "en_attente") return 1;
  if (value.assistance_status === "en_cours") return 2;
  return 3;
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

  return ((data ?? []) as AdminAssistanceRequestRow[]).sort((a, b) => {
    const weightDiff = priorityWeight(a) - priorityWeight(b);
    if (weightDiff !== 0) return weightDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
