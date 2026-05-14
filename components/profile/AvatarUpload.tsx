"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Camera } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  profileId: string;
  /** Seul le titulaire du compte peut pousser vers Storage (RLS sur le préfixe `auth.uid()`). */
  canManageStorage: boolean;
  currentAvatarUrl: string | null;
  onUploaded?: (publicUrl: string) => void;
};

async function fileToJpegBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const max = 1024;
  let w = bitmap.width;
  let h = bitmap.height;
  if (w > max || h > max) {
    const r = Math.min(max / w, max / h);
    w = Math.round(w * r);
    h = Math.round(h * r);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("toBlob"));
      },
      "image/jpeg",
      0.88,
    );
  });
}

/**
 * Prévisualisation immédiate puis upload Supabase Storage (`avatars`), nom `{profileId}-{timestamp}.jpg`.
 * Les anciens fichiers du même préfixe sont supprimés pour libérer l’espace.
 */
export function AvatarUpload({ profileId, canManageStorage, currentAvatarUrl, onUploaded }: Props) {
  const t = useTranslations("memberProfile");
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokePreview = useCallback(() => {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const removeOldAvatars = useCallback(
    async (supabase: ReturnType<typeof createSupabaseBrowserClient>) => {
      const { data: files, error: listErr } = await supabase.storage.from("avatars").list("", { limit: 100 });
      if (listErr) {
        console.error("[AGAPE Avatar] Impossible de lister le bucket avatars :", listErr.message);
        return;
      }
      const mine = (files ?? []).filter((f) => f.name.startsWith(`${profileId}-`));
      if (mine.length === 0) return;
      const paths = mine.map((f) => f.name);
      const { error: rmErr } = await supabase.storage.from("avatars").remove(paths);
      if (rmErr) {
        console.error("[AGAPE Avatar] Suppression des anciennes images refusée :", rmErr.message);
      } else {
        console.log("[AGAPE Avatar] Anciens fichiers supprimés :", paths.join(", "));
      }
    },
    [profileId],
  );

  const onPick = async (file: File | null) => {
    setError(null);
    if (!file) return;
    if (!canManageStorage) {
      setError("forbidden");
      return;
    }

    revokePreview();
    setPreview(URL.createObjectURL(file));

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.id !== profileId) {
        console.error("[AGAPE Avatar] Session ne correspond pas au profil cible.");
        setError("forbidden");
        return;
      }

      await removeOldAvatars(supabase);

      const jpegBlob = await fileToJpegBlob(file);
      const path = `${profileId}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, jpegBlob, {
        contentType: "image/jpeg",
        upsert: false,
      });
      if (upErr) {
        console.error("[AGAPE Avatar] Upload refusé (permissions / quota) :", upErr.message);
        setError("upload");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", profileId);
      if (dbErr) {
        console.error("[AGAPE Avatar] URL publique enregistrée mais mise à jour profil échouée :", dbErr.message);
        setError("db");
        return;
      }

      await supabase
        .from("members_registration")
        .update({ avatar_url: publicUrl })
        .eq("auth_user_id", profileId);

      console.log("[AGAPE Avatar] Nouvelle photo en place :", path);
      onUploaded?.(publicUrl);
    } catch (e) {
      console.error("[AGAPE Avatar] Erreur inattendue :", e);
      setError("upload");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "relative size-28 overflow-hidden rounded-full bg-neutral-100 ring-1 ring-black/[0.06]",
          busy && "opacity-60",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- prévisualisation blob locale
          <img src={preview} alt="" className="size-full object-cover" />
        ) : currentAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL Storage dynamique hors optimisation Next
          <img src={currentAvatarUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-neutral-400">—</div>
        )}
        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <Loader2 className="size-8 animate-spin text-neutral-700" aria-hidden />
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          e.target.value = "";
          void onPick(f);
        }}
      />

      {canManageStorage ? (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          className="h-11 rounded-full border-neutral-200 bg-white px-6 text-[15px] font-medium"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="mr-2 size-4" aria-hidden />
          {t("avatarChangePhoto")}
        </Button>
      ) : null}

      {error ? (
        <p className="text-center text-sm text-red-600">
          {error === "forbidden" ? t("avatarOwnerOnly") : t("avatarErrorGeneric")}
        </p>
      ) : null}
    </div>
  );
}
