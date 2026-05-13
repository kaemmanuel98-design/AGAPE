"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdmin } from "@/lib/admin/auth";
import { uploadPublicMedia } from "@/lib/admin/uploads";
import { isHttpsUrl } from "@/lib/contents/youtube";

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function createLesson(formData: FormData) {
  const locale = normalizeText(formData.get("locale")) || "fr";
  const level = normalizeText(formData.get("level"));
  const moduleTitle = normalizeText(formData.get("module_title"));
  const title = normalizeText(formData.get("title"));
  const contentKind = normalizeText(formData.get("content_kind"));
  const textContent = normalizeText(formData.get("text_content")) || null;
  const videoUrl = normalizeText(formData.get("video_url")) || null;
  const audioUrl = normalizeText(formData.get("audio_url")) || null;
  const author = normalizeText(formData.get("author")) || null;
  const coverImage = normalizeText(formData.get("cover_image")) || null;
  const downloadUrl = normalizeText(formData.get("download_url")) || null;
  const externalLink = normalizeText(formData.get("external_link")) || null;
  const sortOrder = Number.parseInt(normalizeText(formData.get("sort_order")) || "0", 10) || 0;
  const audioFile = formData.get("audio_file");

  if (!level || !moduleTitle || !title) {
    return { ok: false as const, message: "Niveau, module et titre sont requis." };
  }

  if (!["text", "article", "video", "audio", "livre"].includes(contentKind)) {
    return { ok: false as const, message: "Type de leçon invalide." };
  }

  if ((contentKind === "text" || contentKind === "article") && !textContent) {
    return { ok: false as const, message: "Ajoutez le texte de la leçon." };
  }

  if (contentKind === "livre") {
    if (!author) {
      return { ok: false as const, message: "Indiquez l'auteur du livre." };
    }
    if (!coverImage || !isHttpsUrl(coverImage)) {
      return { ok: false as const, message: "Ajoutez une URL HTTPS valide pour la couverture (cover_image)." };
    }
    if (downloadUrl && !isHttpsUrl(downloadUrl)) {
      return { ok: false as const, message: "L'URL du PDF doit être en HTTPS." };
    }
    if (externalLink && !isHttpsUrl(externalLink)) {
      return { ok: false as const, message: "Le lien en ligne doit être en HTTPS." };
    }
  }

  if (contentKind === "video" && (!videoUrl || !isHttpsUrl(videoUrl))) {
    return { ok: false as const, message: "Ajoutez une URL vidéo HTTPS valide." };
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  let resolvedAudioUrl = audioUrl;

  if (audioFile instanceof File && audioFile.size > 0) {
    const uploaded = await uploadPublicMedia(auth.supabase, "lessons", audioFile);
    if (!uploaded.ok) {
      return { ok: false as const, message: uploaded.message };
    }
    resolvedAudioUrl = uploaded.publicUrl;
  }

  if (resolvedAudioUrl && !isHttpsUrl(resolvedAudioUrl)) {
    return { ok: false as const, message: "Ajoutez une URL audio HTTPS valide." };
  }

  if (contentKind === "audio" && !resolvedAudioUrl) {
    return { ok: false as const, message: "Ajoutez un fichier audio ou une URL audio." };
  }

  const bookAuthor = contentKind === "livre" ? author : null;
  const bookCover = contentKind === "livre" ? coverImage : null;
  const bookPdf = contentKind === "livre" && downloadUrl ? downloadUrl : null;
  const bookWeb = contentKind === "livre" && externalLink ? externalLink : null;

  const { error } = await auth.supabase.from("lessons").insert({
    level,
    module_title: moduleTitle,
    title,
    content_kind: contentKind,
    text_content: textContent,
    video_url: videoUrl,
    audio_url: resolvedAudioUrl,
    author: bookAuthor,
    cover_image: bookCover,
    download_url: bookPdf,
    external_link: bookWeb,
    sort_order: sortOrder,
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}/academy`, "layout");
  revalidatePath(`/${locale}/admin`, "layout");
  return { ok: true as const };
}

export async function deleteLesson(formData: FormData) {
  const id = normalizeText(formData.get("id"));
  const locale = normalizeText(formData.get("locale")) || "fr";

  if (!id) {
    return { ok: false as const, message: "Leçon introuvable." };
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  const { error } = await auth.supabase.from("lessons").delete().eq("id", id);
  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}/academy`, "layout");
  revalidatePath(`/${locale}/admin`, "layout");
  return { ok: true as const };
}
