import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { LessonRow } from "./types";

const LESSON_SELECT =
  "id,level,module_title,title,content_kind,text_content,video_url,audio_url,sort_order,created_at";

export async function listAllLessons(): Promise<LessonRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_SELECT)
    .order("level", { ascending: true })
    .order("module_title", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listAllLessons", error);
    return [];
  }

  return (data ?? []) as LessonRow[];
}

export async function getLessonById(id: string): Promise<LessonRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getLessonById", error);
    return null;
  }

  return (data as LessonRow | null) ?? null;
}
