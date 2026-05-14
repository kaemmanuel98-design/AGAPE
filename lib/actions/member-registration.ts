"use server";

import { randomBytes, randomUUID } from "node:crypto";

import { uploadRegistrationAvatarJpeg } from "@/lib/actions/upload-registration-avatar";
import { sendCriticalAssistanceAlertEmail } from "@/lib/notifications/critical-assistance";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

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
  | { status: "success"; severity: "critical" | "standard"; memberId: string }
  | { status: "error"; message: string };

type ProcessOk = {
  ok: true;
  severity: "critical" | "standard";
  criticalAlertSent: boolean;
  memberId: string;
};
type ProcessErr = { ok: false; message: string };

/**
 * Inscription : crée un utilisateur Auth (donc une ligne `profiles` via trigger), ouvre la session,
 * upload éventuel de l’avatar, puis enregistre `members_registration` + met à jour `profiles`.
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

  const rawPhoto = formData.get("profile_photo");
  const photoFile = rawPhoto instanceof File && rawPhoto.size > 0 ? rawPhoto : null;

  const fullName = `${firstName} ${lastName}`.trim();
  const isPriorityEmergency = accompanimentNeed === "urgence";

  let userId: string | null = null;
  const admin = createSupabaseServiceRoleClient();

  try {
    const email = `m-${randomUUID()}@members.agape`;
    const password = `${randomBytes(28).toString("base64url")}Aa1!`;

    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { agape_rejoindre: true },
    });

    if (cErr || !created.user) {
      console.error("[AGAPE Inscription] Création du compte Auth refusée :", cErr?.message ?? "utilisateur absent");
      return { ok: false, message: "db_error" };
    }

    userId = created.user.id;
    console.log("[AGAPE Inscription] Compte Auth créé, identifiant profil :", userId);

    const supabase = await createSupabaseServerClient();
    const { error: sErr } = await supabase.auth.signInWithPassword({ email, password });
    if (sErr) {
      console.error("[AGAPE Inscription] Connexion automatique échouée :", sErr.message);
      await admin.auth.admin.deleteUser(userId);
      userId = null;
      return { ok: false, message: "db_error" };
    }
    console.log("[AGAPE Inscription] Session ouverte pour le nouveau membre.");

    const photoResult = await uploadRegistrationAvatarJpeg(supabase, userId, photoFile);
    if (!photoResult.ok) {
      await admin.auth.admin.deleteUser(userId);
      userId = null;
      return photoResult;
    }

    /**
     * Données membre : tout est persisté dans `public.profiles` (URL photo = bucket `avatars` public).
     * La table `members_registration` est optionnelle selon les déploiements ; on ne dépend plus d’elle pour l’inscription.
     */
    const { error: upErr } = await supabase
      .from("profiles")
      .update({
        first_names: firstName,
        last_name: lastName,
        full_name: fullName,
        phone,
        avatar_url: photoResult.avatarUrl,
        talents,
        member_talents: talents,
        current_need: accompanimentNeed,
        message: supportMessage,
        city,
        preferred_language: preferredLanguage,
      })
      .eq("id", userId);

    if (upErr) {
      console.error("[AGAPE Inscription] Échec mise à jour du profil :", upErr.message);
      await admin.auth.admin.deleteUser(userId);
      userId = null;
      return { ok: false, message: "db_error" };
    }

    console.log("[AGAPE Inscription] Profil enregistré dans `profiles` (photo, besoin, talents).");

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
      memberId: userId,
    };
  } catch (e) {
    console.error("[AGAPE Inscription] Erreur inattendue :", e);
    if (userId) {
      try {
        await admin.auth.admin.deleteUser(userId);
        console.warn("[AGAPE Inscription] Compte Auth supprimé après erreur (rollback).");
      } catch (delErr) {
        console.error("[AGAPE Inscription] Échec rollback Auth :", delErr);
      }
    }
    return { ok: false, message: "unexpected_error" };
  }
}

/**
 * Action serveur pour `useActionState` : le client redirige vers `/profile/[id]` (`id` = `auth.users` / `profiles`).
 */
export async function registerMemberFormAction(
  _prev: MemberRegistrationFormState,
  formData: FormData,
): Promise<MemberRegistrationFormState> {
  const result = await processMemberRegistration(formData);
  if (!result.ok) {
    return { status: "error", message: result.message };
  }
  return { status: "success", severity: result.severity, memberId: result.memberId };
}

export async function registerMember(formData: FormData) {
  return processMemberRegistration(formData);
}

export const createMemberRegistration = registerMember;
