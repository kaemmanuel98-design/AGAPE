"use server";

const MEDIA_BUCKET = "agape-media";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uploadPublicMedia(
  supabase: {
    storage: {
      from: (bucket: string) => {
        upload: (
          path: string,
          body: ArrayBuffer,
          options: { contentType?: string; upsert?: boolean },
        ) => Promise<{ error: { message: string } | null }>;
        getPublicUrl: (path: string) => { data: { publicUrl: string } };
      };
    };
  },
  prefix: string,
  file: File | null,
) {
  if (!file || file.size === 0) {
    return { ok: true as const, publicUrl: null };
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const safeName = slugify(file.name.replace(/\.[^.]+$/, "")) || "media";
  const path = `${prefix}/${Date.now()}-${safeName}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, arrayBuffer, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return { ok: true as const, publicUrl };
}
