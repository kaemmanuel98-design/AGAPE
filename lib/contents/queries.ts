import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { ContentCategory, ContentRow } from "./types";

export async function getContentsByCategory(
  category: ContentCategory,
): Promise<ContentRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contents")
    .select("id,title,content_type,content_url,category,created_at")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getContentsByCategory", error);
    return [];
  }

  return (data ?? []) as ContentRow[];
}

export async function listAllContents(): Promise<ContentRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contents")
    .select("id,title,content_type,content_url,category,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listAllContents", error);
    return [];
  }

  return (data ?? []) as ContentRow[];
}
