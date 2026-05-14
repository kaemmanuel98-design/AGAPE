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

/** État initial et retours de `registerMemberFormAction` (avec `useActionState`). */
export type MemberRegistrationFormState =
  | { status: "idle" }
  | { status: "success"; severity: "critical" | "standard" }
  | { status: "error"; message: string };

type ProcessOk = { ok: true; severity: "critical" | "standard"; criticalAlertSent: boolean };
type ProcessErr = { ok: false; message: string };

/**
 * Inscription membre : validation, puis insertion dans `members_registration`.
 * Les talents sont envoyés en **tableau** (colonne JSONB côté Supabase).
 */
async function processMemberRegistration(formData: FormData): Promise<ProcessOk | ProcessErr> {
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
    return { ok: false, message: "invalid_fields" };
  }

  if (!city || city.length > 160) {
    return { ok: false, message: "invalid_fields" };
  }

  if (!phone || phone.length < 5 || phone.length > 160) {
    return { ok: false, message: "invalid_phone" };
  }

  if (!preferredLanguage || !ALLOWED_LANGUAGES.has(preferredLanguage)) {
    return { ok: false, message: "invalid_fields" };
  }

  if (talents.length === 0) {
    return { ok: false, message: "invalid_fields" };
  }

  if (!accompanimentNeed || !ALLOWED_ACCOMPANIMENT.has(accompanimentNeed)) {
    return { ok: false, message: "invalid_fields" };
  }

  if (supportMessage && supportMessage.length > 2000) {
    return { ok: false, message: "invalid_fields" };
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const situation = `Talents: ${talents.join(", ")}`;
  const isPriorityEmergency = accompanimentNeed === "urgence";

  try {
    const supabase = await createSupabaseServerClient();
    /* Écriture Supabase : une ligne dans `members_registration` (talents = tableau JSON). */
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

    if (error) {
      console.error("[AGAPE Inscription membre] Échec insertion Supabase :", error.message, error);
      return { ok: false, message: "db_error" };
    }

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
      ok: true,
      severity: isPriorityEmergency ? "critical" : "standard",
      criticalAlertSent,
    };
  } catch (e) {
    console.error("[AGAPE Inscription membre] Erreur inattendue :", e);
    return { ok: false, message: "unexpected_error" };
  }
}

/**
 * Action serveur pour `useActionState` : pas de navigation vers une réponse JSON brute —
 * Next renvoie le nouvel état à la même page et le client affiche succès ou erreur.
 */
export async function registerMemberFormAction(
  _prev: MemberRegistrationFormState,
  formData: FormData,
): Promise<MemberRegistrationFormState> {
  const result = await processMemberRegistration(formData);
  if (!result.ok) {
    return { status: "error", message: result.message };
  }
  return { status: "success", severity: result.severity };
}

/** Appel programmatique (tests, scripts) — même logique que le formulaire. */
export async function registerMember(formData: FormData) {
  return processMemberRegistration(formData);
}

/** @deprecated Utiliser `registerMember` — alias conservé pour compatibilité. */
export const createMemberRegistration = registerMember;
