"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { isHttpsUrl } from "@/lib/contents/youtube";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const AUDIO_BUCKET = "audio";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function requireSuperAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, code: "unauthorized", supabase: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "super-admin") {
    return { ok: false as const, code: "forbidden", supabase: null };
  }

  return { ok: true as const, supabase };
}

function stringField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function nullableField(formData: FormData, key: string) {
  const value = stringField(formData, key);
  return value.length > 0 ? value : null;
}

function parseSortOrder(value: string) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

function sanitizeFilename(name: string) {
  const fallback = "audio.mp3";
  return (name || fallback)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || fallback;
}

async function resolveAudioUrl(
  supabase: SupabaseServerClient,
  formData: FormData,
  urlField: string,
  fileField = "audio_file",
) {
  const pastedUrl = nullableField(formData, urlField);
  const file = formData.get(fileField);

  if (!isUploadedFile(file)) {
    return pastedUrl;
  }

  const path = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${sanitizeFilename(file.name)}`;
  const { error } = await supabase.storage.from(AUDIO_BUCKET).upload(path, file, {
    contentType: file.type || "audio/mpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(`audio_upload_failed:${error.message}`);
  }

  const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function revalidateAcademy(locale: string) {
  revalidatePath(`/${locale}/academy`, "page");
  revalidatePath(`/${locale}/admin`, "page");
}

function revalidatePlanning(locale: string) {
  revalidatePath(`/${locale}/planning`, "page");
  revalidatePath(`/${locale}/admin`, "page");
}

export async function createLesson(formData: FormData) {
  const locale = stringField(formData, "locale") || "fr";
  const title = stringField(formData, "title");
  const level = stringField(formData, "level") || "Niveau général";
  const moduleName = stringField(formData, "module") || "Module principal";
  const textContent = nullableField(formData, "text_content");
  const videoUrl = nullableField(formData, "video_url");
  const sortOrder = parseSortOrder(stringField(formData, "sort_order"));

  if (!title || (!textContent && !videoUrl && !formData.get("audio_url") && !formData.get("audio_file"))) {
    return { ok: false as const, message: "missing_fields" };
  }

  if (videoUrl && !isHttpsUrl(videoUrl)) {
    return { ok: false as const, message: "invalid_video_url" };
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  let audioUrl: string | null;
  try {
    audioUrl = await resolveAudioUrl(auth.supabase, formData, "audio_url");
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "audio_upload_failed" };
  }

  if (audioUrl && !isHttpsUrl(audioUrl)) {
    return { ok: false as const, message: "invalid_audio_url" };
  }

  const { error } = await auth.supabase.from("lessons").insert({
    title,
    level,
    module: moduleName,
    text_content: textContent,
    video_url: videoUrl,
    audio_url: audioUrl,
    sort_order: sortOrder,
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidateAcademy(locale);
  return { ok: true as const };
}

export async function deleteLesson(formData: FormData) {
  const locale = stringField(formData, "locale") || "fr";
  const id = stringField(formData, "id");

  if (!id) return { ok: false as const, message: "missing_id" };

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  const { error } = await auth.supabase.from("lessons").delete().eq("id", id);
  if (error) return { ok: false as const, message: error.message };

  revalidateAcademy(locale);
  return { ok: true as const };
}

export async function createPlanningEntry(formData: FormData) {
  const locale = stringField(formData, "locale") || "fr";
  const serviceDate = stringField(formData, "service_date");

  if (!serviceDate) {
    return { ok: false as const, message: "missing_fields" };
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  const { error } = await auth.supabase.from("planning").insert({
    service_date: serviceDate,
    service_name: stringField(formData, "service_name") || "Culte",
    regie: nullableField(formData, "regie"),
    protocole: nullableField(formData, "protocole"),
    louange: nullableField(formData, "louange"),
    predication: nullableField(formData, "predication"),
    intercession: nullableField(formData, "intercession"),
    accueil: nullableField(formData, "accueil"),
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePlanning(locale);
  return { ok: true as const };
}

export async function deletePlanningEntry(formData: FormData) {
  const locale = stringField(formData, "locale") || "fr";
  const id = stringField(formData, "id");

  if (!id) return { ok: false as const, message: "missing_id" };

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  const { error } = await auth.supabase.from("planning").delete().eq("id", id);
  if (error) return { ok: false as const, message: error.message };

  revalidatePlanning(locale);
  return { ok: true as const };
}

export async function createDailyExhortation(formData: FormData) {
  const locale = stringField(formData, "locale") || "fr";
  const message = stringField(formData, "message");
  const exhortationDate = stringField(formData, "exhortation_date") || new Date().toISOString().slice(0, 10);

  if (!message) {
    return { ok: false as const, message: "missing_fields" };
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  let audioUrl: string | null;
  try {
    audioUrl = await resolveAudioUrl(auth.supabase, formData, "audio_url");
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "audio_upload_failed" };
  }

  if (audioUrl && !isHttpsUrl(audioUrl)) {
    return { ok: false as const, message: "invalid_audio_url" };
  }

  const { error } = await auth.supabase.from("daily_exhortations").insert({
    exhortation_date: exhortationDate,
    message,
    audio_url: audioUrl,
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}/admin`, "page");
  return { ok: true as const };
}

export async function deleteDailyExhortation(formData: FormData) {
  const locale = stringField(formData, "locale") || "fr";
  const id = stringField(formData, "id");

  if (!id) return { ok: false as const, message: "missing_id" };

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  const { error } = await auth.supabase.from("daily_exhortations").delete().eq("id", id);
  if (error) return { ok: false as const, message: error.message };

  revalidatePath(`/${locale}/admin`, "page");
  return { ok: true as const };
}
