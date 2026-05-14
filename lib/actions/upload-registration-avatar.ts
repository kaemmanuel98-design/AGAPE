import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

import sharp from "sharp";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

async function fileToJpegBuffer(file: File): Promise<{ ok: true; buffer: Buffer } | { ok: false; message: string }> {
  if (file.size > MAX_PHOTO_BYTES) {
    console.warn("[AGAPE Avatar inscription] Fichier trop volumineux, refus.");
    return { ok: false, message: "invalid_photo" };
  }

  const mime = file.type.toLowerCase();
  if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(mime)) {
    console.warn("[AGAPE Avatar inscription] Type MIME non accepté :", mime);
    return { ok: false, message: "invalid_photo" };
  }

  let input: Buffer;
  try {
    input = Buffer.from(await file.arrayBuffer());
  } catch {
    return { ok: false, message: "invalid_photo" };
  }

  try {
    const jpeg = await sharp(input)
      .rotate()
      .resize(512, 512, { fit: "cover", position: "attention" })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
    return { ok: true, buffer: jpeg };
  } catch (e) {
    console.error("[AGAPE Avatar inscription] Échec du traitement image :", e);
    return { ok: false, message: "invalid_photo" };
  }
}

/**
 * Upload **avant** `auth.signUp` : le bucket `avatars` reçoit un fichier sous `signup-pending/…`
 * (clé **service_role**, sans `auth.uid()`). L’URL publique est passée au trigger via `raw_user_meta_data.avatar_url`.
 */
export async function uploadPendingSignupAvatarJpeg(
  file: File | null,
): Promise<
  | { ok: true; storagePath: string | null; avatarUrl: string | null }
  | { ok: false; message: string }
> {
  if (!file || file.size === 0) {
    return { ok: true, storagePath: null, avatarUrl: null };
  }

  const prepared = await fileToJpegBuffer(file);
  if (!prepared.ok) return prepared;

  const path = `signup-pending/${randomUUID()}.jpg`;
  const blob = new Blob([new Uint8Array(prepared.buffer)], { type: "image/jpeg" });

  try {
    const admin = createSupabaseServiceRoleClient();
    const { error: upErr } = await admin.storage.from("avatars").upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });

    if (upErr) {
      console.error("[AGAPE Avatar inscription] Upload Storage (pré-inscription) refusé :", upErr.message);
      return { ok: false, message: "db_error" };
    }

    const {
      data: { publicUrl },
    } = admin.storage.from("avatars").getPublicUrl(path);

    console.log("[AGAPE Avatar inscription] Upload pré-signUp réussi :", path);

    return { ok: true, storagePath: path, avatarUrl: publicUrl };
  } catch (e) {
    console.error("[AGAPE Avatar inscription] Service role / Storage indisponible :", e);
    return { ok: false, message: "server_config" };
  }
}

/** Supprime un objet uploadé en pré-inscription si `signUp` échoue ensuite. */
export async function deleteSignupPendingAvatarPath(storagePath: string | null): Promise<void> {
  if (!storagePath) return;
  try {
    const admin = createSupabaseServiceRoleClient();
    const { error } = await admin.storage.from("avatars").remove([storagePath]);
    if (error) {
      console.error("[AGAPE Avatar inscription] Nettoyage Storage échoué :", error.message);
    } else {
      console.log("[AGAPE Avatar inscription] Fichier temporaire supprimé :", storagePath);
    }
  } catch (e) {
    console.error("[AGAPE Avatar inscription] Nettoyage Storage :", e);
  }
}

/**
 * Après connexion : upload JPEG `avatars/{userId}-{timestamp}.jpg` (politiques RLS « propriétaire »).
 */
export async function uploadRegistrationAvatarJpeg(
  supabase: SupabaseClient,
  userId: string,
  file: File | null,
): Promise<{ ok: true; avatarUrl: string | null } | { ok: false; message: string }> {
  if (!file || file.size === 0) {
    return { ok: true, avatarUrl: null };
  }

  const prepared = await fileToJpegBuffer(file);
  if (!prepared.ok) return prepared;

  const path = `${userId}-${Date.now()}.jpg`;
  const blob = new Blob([new Uint8Array(prepared.buffer)], { type: "image/jpeg" });

  const { error: upErr } = await supabase.storage.from("avatars").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });

  if (upErr) {
    console.error("[AGAPE Avatar inscription] Échec upload Storage (session) :", upErr.message);
    return { ok: false, message: "db_error" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  console.log("[AGAPE Avatar inscription] Upload réussi (session), objet :", path);

  return { ok: true, avatarUrl: publicUrl };
}
