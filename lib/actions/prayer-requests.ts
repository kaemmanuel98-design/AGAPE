"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendCriticalAssistanceAlertEmail } from "@/lib/notifications/critical-assistance";

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function createPrayerRequest(formData: FormData) {
  const senderName = normalizeText(formData.get("sender_name"));
  const message = normalizeText(formData.get("message"));
  const isAnonymous = formData.get("is_anonymous") === "on";

  if (!message || message.length > 1200) {
    return { ok: false as const, message: "missing_fields" };
  }

  if (!isAnonymous && (!senderName || senderName.length > 120)) {
    return { ok: false as const, message: "missing_fields" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("prayer_requests").insert({
      sender_name: isAnonymous ? null : senderName,
      message,
      is_anonymous: isAnonymous,
      source: "app",
    });

    if (error) {
      return { ok: false as const, message: error.message };
    }

    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "unexpected_error" };
  }
}

const ASSISTANCE_TYPES = new Set([
  "urgence_vitale",
  "maladie",
  "deuil",
  "accompagnement",
]);

export async function createAssistanceRequest(formData: FormData) {
  const assistanceType = normalizeText(formData.get("assistance_type"));
  const message = normalizeText(formData.get("message"));
  const contact = normalizeText(formData.get("contact"));
  const locale = normalizeText(formData.get("locale")) || "fr";

  if (
    !ASSISTANCE_TYPES.has(assistanceType) ||
    !message ||
    message.length > 1200 ||
    !contact ||
    contact.length > 160
  ) {
    return { ok: false as const, message: "missing_fields" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false as const, message: "unauthorized" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_names,last_name")
      .eq("id", user.id)
      .maybeSingle();

    const senderName =
      [profile?.first_names, profile?.last_name].filter(Boolean).join(" ").trim() ||
      user.email ||
      "Membre AGAPE";

    const { error } = await supabase.from("prayer_requests").insert({
      sender_name: senderName,
      message,
      is_anonymous: false,
      requester_user_id: user.id,
      assistance_type: assistanceType,
      contact,
      source: "assistance",
    });

    if (error) {
      return { ok: false as const, message: error.message };
    }

    let criticalAlertSent = false;

    if (assistanceType === "urgence_vitale") {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      const dashboardUrl = siteUrl
        ? new URL(`/${locale}/admin/assistance`, siteUrl).toString()
        : `/${locale}/admin/assistance`;

      const emailResult = await sendCriticalAssistanceAlertEmail({
        requesterName: senderName,
        assistanceType,
        dashboardUrl,
      });

      criticalAlertSent = emailResult.ok;
    }

    return {
      ok: true as const,
      severity: assistanceType === "urgence_vitale" ? ("critical" as const) : ("standard" as const),
      criticalAlertSent,
    };
  } catch {
    return { ok: false as const, message: "unexpected_error" };
  }
}
