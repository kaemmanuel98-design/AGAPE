import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { MemberRegistrationRow } from "./types";

const MEMBERS_REGISTRATION_SELECT =
  "id,first_name,last_name,full_name,phone,city,preferred_language,talents,accompaniment_need,situation,category,support_message,needs_urgent_help,is_priority,is_priority_emergency,avatar_url,archived,admin_notes,created_at";

export async function listMembersRegistration(): Promise<MemberRegistrationRow[]> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "super-admin") return [];

  const { data, error } = await supabase
    .from("members_registration")
    .select(MEMBERS_REGISTRATION_SELECT)
    .eq("archived", false)
    .order("is_priority_emergency", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listMembersRegistration", error);
    return [];
  }

  return (data ?? []) as MemberRegistrationRow[];
}

/** Liste complète des inscriptions (y compris archivées), réservée au super-admin — pour export CSV uniquement. */
export async function listAllMembersRegistrationForExport(): Promise<MemberRegistrationRow[]> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "super-admin") return [];

  const { data, error } = await supabase
    .from("members_registration")
    .select(MEMBERS_REGISTRATION_SELECT)
    .order("archived", { ascending: true })
    .order("is_priority_emergency", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listAllMembersRegistrationForExport", error);
    return [];
  }

  return (data ?? []) as MemberRegistrationRow[];
}
