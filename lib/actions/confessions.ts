"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function createConfession(formData: FormData) {
  const childName = normalizeText(formData.get("child_name"));
  const message = normalizeText(formData.get("message"));

  if (!childName || !message || childName.length > 80 || message.length > 1200) {
    return { ok: false as const, message: "missing_fields" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("confessions").insert({
      child_name: childName,
      message,
      source: "kids",
    });

    if (error) {
      return { ok: false as const, message: error.message };
    }

    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "unexpected_error" };
  }
}
