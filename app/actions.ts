"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

const STATUSES = new Set(["en_attente", "en_cours", "accompagne"]);

export type AssistanceUpdateState =
  | null
  | { ok: true }
  | { ok: false; message: string };

/**
 * `prevState` : valeur renvoyée au cycle précédent par `useActionState` (obligatoire pour l’API React 19).
 * `unknown` plutôt que `any` : la règle ESLint `no-explicit-any` bloque sinon le `next build` sur Vercel.
 */
export async function updateAssistanceRequest(
  prevState: unknown,
  formData: FormData,
): Promise<AssistanceUpdateState> {
  void prevState;
  const id = normalizeText(formData.get("id"));
  const status = normalizeText(formData.get("assistance_status"));
  const internalNotes = normalizeText(formData.get("internal_notes")) || null;
  const locale = normalizeText(formData.get("locale")) || "fr";

  if (!id || !STATUSES.has(status)) {
    return { ok: false as const, message: "invalid_fields" };
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
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "super-admin") {
      return { ok: false as const, message: "forbidden" };
    }

    const { error } = await supabase
      .from("prayer_requests")
      .update({
        assistance_status: status,
        internal_notes: internalNotes,
      })
      .eq("id", id);

    if (error) {
      return { ok: false as const, message: error.message };
    }

    revalidatePath(`/${locale}/admin/assistance`);
    revalidatePath(`/${locale}/admin`);

    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "unexpected_error" };
  }
}
