"use server";

import { createHash } from "node:crypto";

import {
  deleteSignupPendingAvatarPath,
  uploadPendingSignupAvatarJpeg,
} from "@/lib/actions/upload-registration-avatar";
import { sendCriticalAssistanceAlertEmail } from "@/lib/notifications/critical-assistance";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { ensureSupabaseEnvLoaded } from "@/lib/supabase/env.server";

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

function normalizedPhoneIdentity(phone: string) {
  return phone.replace(/[^\d+]/g, "").replace(/^\+/, "").trim();
}

function memberEmailFromPhone(phoneIdentity: string) {
  return `m-${phoneIdentity}@members.agape`;
}

function memberPasswordFromPhone(phoneIdentity: string) {
  const salt = process.env.MEMBER_AUTH_SALT?.trim() || "agape-member-auth";
  const digest = createHash("sha256").update(`${salt}:${phoneIdentity}`).digest("hex");
  return `Agape!${digest.slice(0, 24)}aA1`;
}

async function signInMemberSession(email: string, password: string) {
  try {
    const server = await createSupabaseServerClient();
    const { error } = await server.auth.signInWithPassword({ email, password });
    if (error) {
      console.warn("[AGAPE Inscription] Session non établie :", error.message);
    }
  } catch (e) {
    console.warn("[AGAPE Inscription] Impossible de créer la session utilisateur :", e);
  }
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
 * 2) `auth.admin.createUser` (client **service_role** / `lib/supabaseAdmin.ts`) avec `user_metadata` au format
 *    attendu par `handle_new_user` : `full_name`, `avatar_url`, `current_need`, `city`.
 * 3) Aucune écriture manuelle dans `public.profiles` : le trigger remplit la ligne.
 */
async function processMemberRegistration(formData: FormData): Promise<ProcessOk | ProcessErr> {
  ensureSupabaseEnvLoaded();

  const lastName = clean(formData.get("last_name"));
  const firstName = clean(formData.get("first_name"));
  const phone = clean(formData.get("phone"));
  const city = clean(formData.get("city"));
  const preferredLanguage = clean(formData.get("preferred_language"));
  const accompanimentNeed = clean(formData.get("accompaniment_need"));
  const supportMessage = clean(formData.get("support_message")) || null;
  const locale = clean(formData.get("locale")) || "fr";
  const phoneIdentity = normalizedPhoneIdentity(phone);

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
  if (!phoneIdentity) {
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
    const email = memberEmailFromPhone(phoneIdentity);
    const password = memberPasswordFromPhone(phoneIdentity);

    const admin = createSupabaseAdminClient();
    const { data: existingByPhone } = await admin
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .eq("role", "member")
      .maybeSingle();

    if (existingByPhone?.id) {
      await admin.auth.admin.updateUserById(existingByPhone.id, {
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          avatar_url: pendingUpload.avatarUrl ?? "",
          current_need: accompanimentNeed,
          city,
        },
      });

      const { error: updateExistingErr } = await admin
        .from("profiles")
        .update({
          email,
          full_name: fullName,
          first_names: firstName,
          last_name: lastName,
          phone,
          city,
          preferred_language: preferredLanguage,
          current_need: accompanimentNeed,
          avatar_url: pendingUpload.avatarUrl || null,
          talents,
          member_talents: talents,
          message: supportMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingByPhone.id);

      if (updateExistingErr) {
        console.warn("[AGAPE Inscription] Profil existant non mis à jour :", updateExistingErr.message);
      }

      pendingStoragePath = null;
      await signInMemberSession(email, password);

      return {
        ok: true,
        severity: isPriorityEmergency ? "critical" : "standard",
        criticalAlertSent: false,
        memberId: existingByPhone.id,
        pendingEmailVerification: false,
      };
    }

    console.log("[AGAPE Inscription] Création du compte via service role…");
    const { data: signData, error: signErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        avatar_url: pendingUpload.avatarUrl ?? "",
        current_need: accompanimentNeed,
        city,
      },
    });

    if (signErr) {
      console.error(
        "[AGAPE Inscription] createUser refusé :",
        signErr.message,
        "code =",
        signErr.code,
        "status =",
        signErr.status,
        signErr,
      );
      await deleteSignupPendingAvatarPath(pendingStoragePath);
      pendingStoragePath = null;
      return { ok: false, message: "create_user_error" };
    }

    const userId = signData.user?.id;
    if (!userId) {
      console.error("[AGAPE Inscription] createUser sans identifiant utilisateur.");
      await deleteSignupPendingAvatarPath(pendingStoragePath);
      pendingStoragePath = null;
      return { ok: false, message: "create_user_error" };
    }

  /** Champs présents sur le projet Supabase actuel (voir scripts/check-profiles-schema.mjs). */
    const { error: profileErr } = await admin.from("profiles").upsert(
      {
        id: userId,
        email,
        role: "member",
        full_name: fullName,
        phone,
        city,
        avatar_url: pendingUpload.avatarUrl || null,
        current_need: accompanimentNeed,
      },
      { onConflict: "id" },
    );

    if (profileErr) {
      console.error("[AGAPE Inscription] Mise à jour profiles après createUser :", profileErr.message, profileErr);
    }

    console.log("[AGAPE Inscription] Compte créé ; profil synchronisé. id =", userId);

    pendingStoragePath = null;

    /** Compte créé mais e-mail pas encore confirmé (réglage projet Supabase « Confirm email »). */
    const pendingEmailVerification = !signData.user?.email_confirmed_at;

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
    if (
      e instanceof Error &&
      (e.message.includes("SUPABASE_SERVICE_ROLE_KEY") || e.message.includes("NEXT_PUBLIC_SUPABASE_URL"))
    ) {
      return { ok: false, message: "server_config" };
    }
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
    if (process.env.NODE_ENV === "development") {
      console.error("[AGAPE Inscription] Échec formulaire, code erreur :", result.message);
    }
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
