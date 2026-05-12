"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function createBirthdayMessage(formData: FormData) {
  const recipientProfileId = normalizeText(formData.get("recipient_profile_id"));
  const recipientName = normalizeText(formData.get("recipient_name"));
  const senderName = normalizeText(formData.get("sender_name")) || null;
  const message = normalizeText(formData.get("message"));
  const source = normalizeText(formData.get("source")) || "calendar";

  if (
    !recipientProfileId ||
    !recipientName ||
    !message ||
    message.length > 300 ||
    (senderName && senderName.length > 80) ||
    !["calendar", "home"].includes(source)
  ) {
    return { ok: false as const, message: "invalid_fields" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("birthday_messages").insert({
      recipient_profile_id: recipientProfileId,
      recipient_name: recipientName,
      sender_name: senderName,
      message,
      source,
    });

    if (error) {
      return { ok: false as const, message: error.message };
    }

    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "unexpected_error" };
  }
}
