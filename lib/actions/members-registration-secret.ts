"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function trim(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

/** État renvoyé à `useActionState` après archivage ou sauvegarde des notes admin. */
export type MemberRegistrationAdminState = null | { ok: true } | { ok: false; message: string };

async function getSuperAdminClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, supabase: null };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role !== "super-admin") return { ok: false as const, supabase: null };

  return { ok: true as const, supabase };
}

function revalidateMemberConsoles(locale: string) {
  revalidatePath(`/${locale}/management-agape-secret`);
  revalidatePath(`/${locale}/admin-secret-dashboard`);
}

/**
 * `prevState` : requis pour être compatible avec `useActionState` (premier argument toujours injecté par React).
 * `unknown` : évite `any` (ESLint `no-explicit-any` lors du `next build` Vercel).
 */
export async function archiveMemberRegistration(
  prevState: unknown,
  formData: FormData,
): Promise<MemberRegistrationAdminState> {
  void prevState;

  const id = trim(formData.get("id"));
  const locale = trim(formData.get("locale")) || "fr";

  if (!id) {
    return { ok: false, message: "invalid_id" };
  }

  const auth = await getSuperAdminClient();
  if (!auth.ok || !auth.supabase) {
    return { ok: false, message: "forbidden" };
  }

  const { error } = await auth.supabase.from("members_registration").update({ archived: true }).eq("id", id);

  if (error) {
    console.error("archiveMemberRegistration", error);
    return { ok: false, message: error.message };
  }

  revalidateMemberConsoles(locale);
  return { ok: true };
}

/**
 * Même signature `(prevState, formData)` que l’archivage : nécessaire pour l’usage avec `useActionState` sur le `<form>`.
 * `unknown` : même raison ESLint que pour `archiveMemberRegistration`.
 */
export async function updateMemberAdminNotes(
  prevState: unknown,
  formData: FormData,
): Promise<MemberRegistrationAdminState> {
  void prevState;

  const id = trim(formData.get("id"));
  const locale = trim(formData.get("locale")) || "fr";
  const adminNotes = trim(formData.get("admin_notes"));

  if (!id) {
    return { ok: false, message: "invalid_id" };
  }
  if (adminNotes.length > 8000) {
    return { ok: false, message: "notes_too_long" };
  }

  const auth = await getSuperAdminClient();
  if (!auth.ok || !auth.supabase) {
    return { ok: false, message: "forbidden" };
  }

  const { error } = await auth.supabase
    .from("members_registration")
    .update({ admin_notes: adminNotes || null })
    .eq("id", id);

  if (error) {
    console.error("updateMemberAdminNotes", error);
    return { ok: false, message: error.message };
  }

  revalidateMemberConsoles(locale);
  return { ok: true };
}
