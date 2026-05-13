"use server";

import { sendCriticalAssistanceAlertEmail } from "@/lib/notifications/critical-assistance";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_LANGUAGES = new Set(["fr", "en", "nl", "autre"]);
const ALLOWED_TALENTS = new Set([
  "musique_piano",
  "academie",
  "technique_it",
  "organisation",
  "ecoute_benevole",
]);
const ALLOWED_ACCOMPANIMENT = new Set(["soutien_moral", "deuil", "maladie", "urgence"]);

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function createMemberRegistration(formData: FormData) {
  const lastName = clean(formData.get("last_name"));
  const firstName = clean(formData.get("first_name"));
  const phone = clean(formData.get("phone"));
  const city = clean(formData.get("city"));
  const preferredLanguage = clean(formData.get("preferred_language"));
  const accompanimentNeed = clean(formData.get("accompaniment_need"));
  const supportMessage = clean(formData.get("support_message")) || null;
  const locale = clean(formData.get("locale")) || "fr";

  const talentEntries = formData.getAll("talents").map(String).map((t) => t.trim());
  const talents = [...new Set(talentEntries)].filter((t) => ALLOWED_TALENTS.has(t));

  if (!lastName || lastName.length > 120 || !firstName || firstName.length > 120) {
    return { ok: false as const, message: "invalid_fields" as const };
  }

  if (!city || city.length > 160) {
    return { ok: false as const, message: "invalid_fields" as const };
  }

  if (!phone || phone.length < 5 || phone.length > 160) {
    return { ok: false as const, message: "invalid_phone" as const };
  }

  if (!preferredLanguage || !ALLOWED_LANGUAGES.has(preferredLanguage)) {
    return { ok: false as const, message: "invalid_fields" as const };
  }

  if (talents.length === 0) {
    return { ok: false as const, message: "invalid_fields" as const };
  }

  if (!accompanimentNeed || !ALLOWED_ACCOMPANIMENT.has(accompanimentNeed)) {
    return { ok: false as const, message: "invalid_fields" as const };
  }

  if (supportMessage && supportMessage.length > 2000) {
    return { ok: false as const, message: "invalid_fields" as const };
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const situation = `Talents: ${talents.join(", ")}`;
  const isPriorityEmergency = accompanimentNeed === "urgence";

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("members_registration").insert({
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      phone,
      city,
      preferred_language: preferredLanguage,
      talents,
      accompaniment_need: accompanimentNeed,
      category: accompanimentNeed,
      situation,
      support_message: supportMessage,
      needs_urgent_help: isPriorityEmergency,
      is_priority: isPriorityEmergency,
      is_priority_emergency: isPriorityEmergency,
    });

    if (error) return { ok: false as const, message: error.message };

    let criticalAlertSent = false;
    if (isPriorityEmergency) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      const dashboardUrl = siteUrl
        ? new URL(`/${locale}/admin-secret-dashboard`, siteUrl).toString()
        : `/${locale}/admin-secret-dashboard`;
      const alert = await sendCriticalAssistanceAlertEmail({
        requesterName: fullName || "Nouveau membre AGAPE",
        assistanceType: "urgence_vitale",
        dashboardUrl,
      });
      criticalAlertSent = alert.ok;
    }

    return {
      ok: true as const,
      severity: isPriorityEmergency ? ("critical" as const) : ("standard" as const),
      criticalAlertSent,
    };
  } catch {
    return { ok: false as const, message: "unexpected_error" as const };
  }
}
