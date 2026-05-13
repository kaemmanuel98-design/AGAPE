import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { MemberRegistrationRow } from "./types";

const MEMBERS_REGISTRATION_SELECT =
  "id,full_name,phone,city,situation,category,support_message,needs_urgent_help,created_at";

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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listMembersRegistration", error);
    return [];
  }

  return (data ?? []) as MemberRegistrationRow[];
}
