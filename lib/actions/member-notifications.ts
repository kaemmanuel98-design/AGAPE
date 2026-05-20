"use server";

import { revalidatePath } from "next/cache";

import { syncBirthdayNotificationsForMember } from "@/lib/notifications/birthday-notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markNotificationRead(notificationId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const };
  }

  const { error } = await supabase
    .from("member_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_profile_id", user.id);

  if (error) {
    return { ok: false as const };
  }

  revalidatePath("/calendar");
  revalidatePath("/academy");
  revalidatePath("/bible-strong");
  return { ok: true as const };
}

export async function markAllNotificationsRead() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const };
  }

  const { error } = await supabase
    .from("member_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_profile_id", user.id)
    .is("read_at", null);

  if (error) {
    return { ok: false as const };
  }

  revalidatePath("/calendar");
  return { ok: true as const };
}

/** Appelé au chargement du hub pour un membre connecté. */
export async function ensureBirthdayNotificationsForCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_language")
    .eq("id", user.id)
    .maybeSingle();

  await syncBirthdayNotificationsForMember(user.id, profile?.preferred_language);
}
