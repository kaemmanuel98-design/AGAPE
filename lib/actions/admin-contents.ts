"use server";

import { revalidatePath } from "next/cache";

import {
  isHttpsUrl,
  isYoutubeUrl,
} from "@/lib/contents/youtube";
import type { ContentCategory, ContentType } from "@/lib/contents/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

export async function createContent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const contentType = String(formData.get("content_type") ?? "").trim() as ContentType;
  const contentUrl = String(formData.get("content_url") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() as ContentCategory;
  const locale = String(formData.get("locale") ?? "fr");

  if (!title || !contentUrl) {
    return { ok: false as const, message: "missing_fields" };
  }

  if (contentType !== "video" && contentType !== "pdf") {
    return { ok: false as const, message: "invalid_type" };
  }

  if (category !== "adult" && category !== "child") {
    return { ok: false as const, message: "invalid_category" };
  }

  if (contentType === "video" && !isYoutubeUrl(contentUrl)) {
    return { ok: false as const, message: "invalid_youtube" };
  }

  if (contentType === "pdf" && !isHttpsUrl(contentUrl)) {
    return { ok: false as const, message: "invalid_pdf_url" };
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  const { error } = await auth.supabase.from("contents").insert({
    title,
    content_type: contentType,
    content_url: contentUrl,
    category,
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/kids`, "layout");
  revalidatePath(`/${locale}/admin`, "layout");
  return { ok: true as const };
}

export async function deleteContent(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "fr");

  if (!id) {
    return { ok: false as const, message: "missing_id" };
  }

  const auth = await requireSuperAdmin();
  if (!auth.ok || !auth.supabase) {
    return { ok: false as const, message: auth.code };
  }

  const { error } = await auth.supabase.from("contents").delete().eq("id", id);

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/${locale}`, "layout");
  revalidatePath(`/${locale}/kids`, "layout");
  revalidatePath(`/${locale}/admin`, "layout");
  return { ok: true as const };
}
