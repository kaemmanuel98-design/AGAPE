"use server";

import { sendCriticalAssistanceAlertEmail } from "@/lib/notifications/critical-assistance";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CRITICAL_CATEGORIES = new Set(["urgence_vitale", "danger_immediat"]);

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function createMemberRegistration(formData: FormData) {
  const fullName = clean(formData.get("full_name"));
  const phone = clean(formData.get("phone"));
  const city = clean(formData.get("city")) || null;
  const situation = clean(formData.get("situation")) || null;
  const supportMessage = clean(formData.get("support_message")) || null;
  const category = clean(formData.get("category")) || null;
  const locale = clean(formData.get("locale")) || "fr";
  const needsUrgentHelp = formData.get("needs_urgent_help") === "on";

  if (!phone || phone.length > 160) {
    return { ok: false as const, message: "invalid_phone" as const };
  }

  if (fullName.length > 160 || (supportMessage && supportMessage.length > 2000)) {
    return { ok: false as const, message: "invalid_fields" as const };
  }

  const isCritical = needsUrgentHelp || CRITICAL_CATEGORIES.has(String(category));

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("members_registration").insert({
      full_name: fullName || null,
      phone,
      city,
      situation,
      support_message: supportMessage,
      category,
      needs_urgent_help: needsUrgentHelp,
    });

    if (error) return { ok: false as const, message: error.message };

    let criticalAlertSent = false;
    if (isCritical) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      const dashboardUrl = siteUrl
        ? new URL(`/${locale}/admin/assistance`, siteUrl).toString()
        : `/${locale}/admin/assistance`;
      const alert = await sendCriticalAssistanceAlertEmail({
        requesterName: fullName || "Nouveau membre AGAPE",
        assistanceType: "urgence_vitale",
        dashboardUrl,
      });
      criticalAlertSent = alert.ok;
    }

    return {
      ok: true as const,
      severity: isCritical ? ("critical" as const) : ("standard" as const),
      criticalAlertSent,
    };
  } catch {
    return { ok: false as const, message: "unexpected_error" as const };
  }
}
