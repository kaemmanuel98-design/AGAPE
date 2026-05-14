import type { SupabaseClient } from "@supabase/supabase-js";

import type { LessonRow } from "./types";
import { createClient } from "@/utils/supabase/server";

/** Colonnes alignées sur `public.academy_courses` (Supabase). */
export const ACADEMY_COURSE_SELECT =
  "id,level,module_title,title,content_kind,text_content,video_url,audio_url,author,cover_image,download_url,external_link,is_featured,sort_order,created_at";

/**
 * Lecture catalogue Academy.
 *
 * --- Appel SQL ---
 * `SELECT` colonnes listées sur `public.academy_courses`
 * `ORDER BY is_featured DESC` (les fiches « à la une » en premier côté SQL)
 * puis `sort_order`, `level`, `module_title`, `created_at` pour un ordre stable.
 */
export async function fetchAcademyCourses(supabase: SupabaseClient): Promise<{
  lessons: LessonRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("academy_courses")
    .select(ACADEMY_COURSE_SELECT)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("level", { ascending: true })
    .order("module_title", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[AGAPE Academy] Échec du catalogue `academy_courses` :", error.message, error);
    return { lessons: [], error: error.message };
  }

  return { lessons: (data ?? []) as LessonRow[], error: null };
}

/**
 * Même lecture que `fetchAcademyCourses`, en ouvrant un client serveur dédié.
 * (Utilisé par l’admin ; le client provient toujours de `@/utils/supabase/server`.)
 */
export async function listAllLessons(): Promise<{ lessons: LessonRow[]; error: string | null }> {
  const supabase = await createClient();
  return fetchAcademyCourses(supabase);
}

/**
 * Détail d’un cours.
 *
 * --- Appel SQL ---
 * `SELECT` colonnes catalogue sur `public.academy_courses`
 * `WHERE id = :id`
 * `LIMIT 1` (via `.maybeSingle()` côté client Supabase).
 */
export async function getLessonById(id: string): Promise<LessonRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("academy_courses")
    .select(ACADEMY_COURSE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "[AGAPE Academy] Échec de lecture du cours par id sur `academy_courses` :",
      error.message,
      "| id =",
      id,
    );
    return null;
  }

  return (data as LessonRow | null) ?? null;
}
