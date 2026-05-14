import type { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

/**
 * Upload JPEG dans le bucket `avatars`, nom `{userId}-{timestamp}.jpg` (évite les collisions).
 * Appelé **après** `signInWithPassword` pour que les politiques RLS « propriétaire » s’appliquent.
 *
 * L’URL publique suit le schéma Supabase :
 * `{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/{userId}-{timestamp}.jpg`
 */
export async function uploadRegistrationAvatarJpeg(
  supabase: SupabaseClient,
  userId: string,
  file: File | null,
): Promise<{ ok: true; avatarUrl: string | null } | { ok: false; message: string }> {
  if (!file || file.size === 0) {
    return { ok: true, avatarUrl: null };
  }

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

  let jpeg: Buffer;
  try {
    jpeg = await sharp(input)
      .rotate()
      .resize(512, 512, { fit: "cover", position: "attention" })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
  } catch (e) {
    console.error("[AGAPE Avatar inscription] Échec du traitement image :", e);
    return { ok: false, message: "invalid_photo" };
  }

  const path = `${userId}-${Date.now()}.jpg`;
  const blob = new Blob([new Uint8Array(jpeg)], { type: "image/jpeg" });

  const { error: upErr } = await supabase.storage.from("avatars").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });

  if (upErr) {
    console.error(
      "[AGAPE Avatar inscription] Échec upload Storage (vérifie les politiques RLS / bucket avatars) :",
      upErr.message,
    );
    return { ok: false, message: "db_error" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  console.log("[AGAPE Avatar inscription] Upload réussi, objet :", path);

  return { ok: true, avatarUrl: publicUrl };
}
