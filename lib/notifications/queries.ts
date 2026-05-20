import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { MemberNotificationRow } from "./types";

export async function listUnreadMemberNotifications(limit = 12) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [] as MemberNotificationRow[];

  const { data, error } = await supabase
    .from("member_notifications")
    .select(
      "id,recipient_profile_id,kind,subject_profile_id,notification_date,title,body,read_at,created_at",
    )
    .eq("recipient_profile_id", user.id)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[AGAPE notifications] listUnread", error.message);
    return [];
  }

  return (data ?? []) as MemberNotificationRow[];
}

export async function countUnreadMemberNotifications() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count, error } = await supabase
    .from("member_notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_profile_id", user.id)
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}
