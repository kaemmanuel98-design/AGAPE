import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { ChildProfileRow, MemberProfileRow } from "./types";

const PROFILE_SELECT =
  "id,role,first_names,last_name,full_name,birth_date,phone,address,avatar_url,member_talents,talents,current_need,message,city,preferred_language,updated_at";

export async function getCurrentProfile(): Promise<{
  userId: string | null;
  profile: MemberProfileRow | null;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, profile: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getCurrentProfile", error);
    return { userId: user.id, profile: null };
  }

  return { userId: user.id, profile: (data as MemberProfileRow | null) ?? null };
}

export async function listCurrentChildProfiles(): Promise<ChildProfileRow[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("child_profiles")
    .select("id,parent_id,first_names,last_name,phone,address,avatar_url,created_at,updated_at")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listCurrentChildProfiles", error);
    return [];
  }

  return (data ?? []) as ChildProfileRow[];
}
