"use server";

import { revalidatePath } from "next/cache";

import { uploadPublicMedia } from "@/lib/admin/uploads";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

async function requireAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, message: "unauthorized", supabase: null, userId: null };
  }

  return { ok: true as const, supabase, userId: user.id };
}

export async function updateMemberProfile(formData: FormData) {
  const locale = normalizeText(formData.get("locale")) || "fr";
  const firstNames = normalizeText(formData.get("first_names"));
  const lastName = normalizeText(formData.get("last_name"));
  const birthDate = normalizeText(formData.get("birth_date")) || null;
  const phone = normalizeText(formData.get("phone")) || null;
  const address = normalizeText(formData.get("address")) || null;
  const avatarUrlInput = normalizeText(formData.get("avatar_url")) || null;
  const avatarFile = formData.get("avatar_file");

  if (!firstNames || !lastName) {
    return { ok: false as const, message: "Noms et prénoms sont requis." };
  }

  const auth = await requireAuthenticatedUser();
  if (!auth.ok || !auth.supabase || !auth.userId) {
    return { ok: false as const, message: "Session expirée. Reconnectez-vous." };
  }

  let avatarUrl = avatarUrlInput;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const uploaded = await uploadPublicMedia(auth.supabase, `profiles/${auth.userId}`, avatarFile);
    if (!uploaded.ok) {
      return { ok: false as const, message: uploaded.message };
    }
    avatarUrl = uploaded.publicUrl;
  }

  const { error } = await auth.supabase
    .from("profiles")
    .update({
      first_names: firstNames,
      last_name: lastName,
      birth_date: birthDate,
      phone,
      address,
      avatar_url: avatarUrl,
    })
    .eq("id", auth.userId);

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}/profile`, "layout");
  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/calendar`, "layout");
  return { ok: true as const };
}

export async function saveChildProfile(formData: FormData) {
  const locale = normalizeText(formData.get("locale")) || "fr";
  const childId = normalizeText(formData.get("child_id")) || null;
  const firstNames = normalizeText(formData.get("first_names"));
  const lastName = normalizeText(formData.get("last_name")) || null;
  const phone = normalizeText(formData.get("phone")) || null;
  const address = normalizeText(formData.get("address")) || null;
  const avatarUrlInput = normalizeText(formData.get("avatar_url")) || null;
  const avatarFile = formData.get("avatar_file");

  if (!firstNames) {
    return { ok: false as const, message: "Le prénom de l’enfant est requis." };
  }

  const auth = await requireAuthenticatedUser();
  if (!auth.ok || !auth.supabase || !auth.userId) {
    return { ok: false as const, message: "Session expirée. Reconnectez-vous." };
  }

  let avatarUrl = avatarUrlInput;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const uploaded = await uploadPublicMedia(auth.supabase, `children/${auth.userId}`, avatarFile);
    if (!uploaded.ok) {
      return { ok: false as const, message: uploaded.message };
    }
    avatarUrl = uploaded.publicUrl;
  }

  const payload = {
    parent_id: auth.userId,
    first_names: firstNames,
    last_name: lastName,
    phone,
    address,
    avatar_url: avatarUrl,
  };

  const query = childId
    ? auth.supabase.from("child_profiles").update(payload).eq("id", childId).eq("parent_id", auth.userId)
    : auth.supabase.from("child_profiles").insert(payload);

  const { error } = await query;
  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}/profile`, "layout");
  return { ok: true as const };
}

export async function deleteChildProfile(formData: FormData) {
  const locale = normalizeText(formData.get("locale")) || "fr";
  const childId = normalizeText(formData.get("child_id"));

  if (!childId) {
    return { ok: false as const, message: "Profil enfant introuvable." };
  }

  const auth = await requireAuthenticatedUser();
  if (!auth.ok || !auth.supabase || !auth.userId) {
    return { ok: false as const, message: "Session expirée. Reconnectez-vous." };
  }

  const { error } = await auth.supabase
    .from("child_profiles")
    .delete()
    .eq("id", childId)
    .eq("parent_id", auth.userId);

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}/profile`, "layout");
  return { ok: true as const };
}
