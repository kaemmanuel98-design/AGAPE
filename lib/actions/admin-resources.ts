"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function isYoutubeUrl(url: string) {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return false;
    return (
      u.hostname.includes("youtube.com") ||
      u.hostname.includes("youtu.be")
    );
  } catch {
    return false;
  }
}

async function getSuperAdminClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "unauthorized" as const, supabase: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "super-admin") {
    return { error: "forbidden" as const, supabase: null };
  }

  return { error: null, supabase };
}

export async function createYoutubeResource(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const youtubeUrl = String(formData.get("youtube_url") ?? "").trim();
  const locale = String(formData.get("locale") ?? "fr");

  if (!title || !youtubeUrl) {
    return { ok: false as const, message: "missing_fields" };
  }
  if (!isYoutubeUrl(youtubeUrl)) {
    return { ok: false as const, message: "invalid_youtube" };
  }

  const { error, supabase } = await getSuperAdminClient();
  if (error || !supabase) {
    return { ok: false as const, message: error };
  }

  const { error: insertError } = await supabase.from("resources").insert({
    title,
    resource_type: "youtube",
    youtube_url: youtubeUrl,
    pdf_url: null,
    pdf_filename: null,
  });

  if (insertError) {
    return { ok: false as const, message: insertError.message };
  }

  revalidatePath(`/${locale}`, "layout");
  return { ok: true as const };
}

export async function uploadTeachingPdf(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const locale = String(formData.get("locale") ?? "fr");
  const file = formData.get("pdf");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, message: "missing_file" };
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false as const, message: "invalid_pdf" };
  }

  const { error, supabase } = await getSuperAdminClient();
  if (error || !supabase) {
    return { ok: false as const, message: error };
  }

  const safeBase = `${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("teaching-pdfs")
    .upload(safeBase, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return { ok: false as const, message: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("teaching-pdfs").getPublicUrl(safeBase);

  const displayTitle = title || file.name.replace(/\.pdf$/i, "");

  const { error: insertError } = await supabase.from("resources").insert({
    title: displayTitle,
    resource_type: "pdf",
    youtube_url: null,
    pdf_url: publicUrl,
    pdf_filename: file.name,
  });

  if (insertError) {
    return { ok: false as const, message: insertError.message };
  }

  revalidatePath(`/${locale}`, "layout");
  return { ok: true as const };
}
