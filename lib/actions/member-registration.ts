"use server";

import { randomBytes, randomUUID } from "node:crypto";

import {
  deleteSignupPendingAvatarPath,
  uploadPendingSignupAvatarJpeg,
} from "@/lib/actions/upload-registration-avatar";
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
  | {
      status: "success";
      severity: "critical" | "standard";
      memberId: string;
      /** `true` si aucune session après signUp (ex. confirmation e-mail activée côté Supabase). */
      pendingEmailVerification: boolean;
    }
  | { status: "error"; message: string };

type ProcessOk = {
  ok: true;
  severity: "critical" | "standard";
  criticalAlertSent: boolean;
  memberId: string;
  pendingEmailVerification: boolean;
};
type ProcessErr = { ok: false; message: string };

/**
 * Inscription `/rejoindre` :
 * 1) Upload éventuel de la photo dans `avatars` **avant** `signUp` (échec → arrêt, pas de compte créé).
 * 2) `supabase.auth.signUp` avec `options.data` **strictement** au format attendu par `handle_new_user` :
 *    `full_name`, `avatar_url`, `current_need`, `city` (photo uploadée avant via **service_role**).
 * 3) Aucune écriture manuelle dans `public.profiles` : le trigger remplit la ligne.
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

  const pendingUpload = await uploadPendingSignupAvatarJpeg(photoFile);
  if (!pendingUpload.ok) {
    return pendingUpload;
  }

  let pendingStoragePath = pendingUpload.storagePath;

  try {
    const email = `m-${randomUUID()}@members.agape`;
    const password = `${randomBytes(28).toString("base64url")}Aa1!`;

    const supabase = await createSupabaseServerClient();
    const { data: signData, error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: pendingUpload.avatarUrl ?? "",
          current_need: accompanimentNeed,
          city,
        },
      },
    });

    if (signErr) {
      console.error("[AGAPE Inscription] signUp refusé :", signErr.message);
      await deleteSignupPendingAvatarPath(pendingStoragePath);
      pendingStoragePath = null;
      return { ok: false, message: "db_error" };
    }

    const userId = signData.user?.id;
    if (!userId) {
      console.error("[AGAPE Inscription] signUp sans identifiant utilisateur.");
      await deleteSignupPendingAvatarPath(pendingStoragePath);
      pendingStoragePath = null;
      return { ok: false, message: "db_error" };
    }

    console.log(
      "[AGAPE Inscription] signUp réussi ; profil créé par le trigger (metadata : full_name, avatar_url, …). id =",
      userId,
    );

    pendingStoragePath = null;

    /** Session absente mais utilisateur créé → en général confirmation e-mail requise. */
    const pendingEmailVerification = Boolean(signData.user && !signData.session);

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
      pendingEmailVerification,
    };
  } catch (e) {
    console.error("[AGAPE Inscription] Erreur inattendue :", e);
    await deleteSignupPendingAvatarPath(pendingStoragePath);
    return { ok: false, message: "unexpected_error" };
  }
}

/**
 * Action serveur pour `useActionState` : redirection client vers `/profile/[id]` après succès.
 */
export async function registerMemberFormAction(
  _prev: MemberRegistrationFormState,
  formData: FormData,
): Promise<MemberRegistrationFormState> {
  const result = await processMemberRegistration(formData);
  if (!result.ok) {
    return { status: "error", message: result.message };
  }
  return {
    status: "success",
    severity: result.severity,
    memberId: result.memberId,
    pendingEmailVerification: result.pendingEmailVerification,
  };
}

export async function registerMember(formData: FormData) {
  return processMemberRegistration(formData);
}

export const createMemberRegistration = registerMember;
