"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdmin } from "@/lib/admin/auth";
import { uploadPublicMedia } from "@/lib/admin/uploads";
import { isHttpsUrl } from "@/lib/contents/youtube";

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function upsertDailyExhortation(formData: FormData) {
  const locale = normalizeText(formData.get("locale")) || "fr";
  const exhortationDate = normalizeText(formData.get("exhortation_date")) || new Date().toISOString().slice(0, 10);
  const title = normalizeText(formData.get("title")) || "Exhortation du jour";
  const message = normalizeText(formData.get("message")) || null;
  const audioUrl = normalizeText(formData.get("audio_url")) || null;
  const audioFile = formData.get("audio_file");

  if (!message && !(audioFile instanceof File && audioFile.size > 0) && !audioUrl) {
    return { ok: false as const, message: "Ajoutez un message ou un audio." };
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  let resolvedAudioUrl = audioUrl;

  if (audioFile instanceof File && audioFile.size > 0) {
    const uploaded = await uploadPublicMedia(auth.supabase, "exhortations", audioFile);
    if (!uploaded.ok) {
      return { ok: false as const, message: uploaded.message };
    }
    resolvedAudioUrl = uploaded.publicUrl;
  }

  if (resolvedAudioUrl && !isHttpsUrl(resolvedAudioUrl)) {
    return { ok: false as const, message: "Ajoutez une URL audio HTTPS valide." };
  }

  const { error } = await auth.supabase.from("daily_exhortations").upsert(
    {
      exhortation_date: exhortationDate,
      title,
      message,
      audio_url: resolvedAudioUrl,
    },
    { onConflict: "exhortation_date" },
  );

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/admin`, "layout");
  return { ok: true as const };
}

export async function deleteDailyExhortation(formData: FormData) {
  const locale = normalizeText(formData.get("locale")) || "fr";
  const id = normalizeText(formData.get("id"));

  if (!id) {
    return { ok: false as const, message: "Exhortation introuvable." };
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  const { error } = await auth.supabase.from("daily_exhortations").delete().eq("id", id);
  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/admin`, "layout");
  return { ok: true as const };
}
