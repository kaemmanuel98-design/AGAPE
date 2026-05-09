import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { ResourceRow } from "./types";

export async function getResourcesForDiscover(): Promise<ResourceRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resources")
    .select("id,title,resource_type,youtube_url,pdf_url,pdf_filename,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getResourcesForDiscover", error);
    return [];
  }

  return (data ?? []) as ResourceRow[];
}
