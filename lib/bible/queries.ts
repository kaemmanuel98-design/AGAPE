import "server-only";

import type { BibleVerseWithVersion, BibleVersionRow } from "@/lib/bible/types";
import { createClient } from "@/utils/supabase/server";

/** Ici on récupère toutes les versions bibliques publiées (lecture anon). */
export async function fetchBibleVersions(): Promise<BibleVersionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bible_versions")
    .select("id, slug, title, language, notes, created_at")
    .order("title", { ascending: true });

  if (error) {
    console.error("[AGAPE Bible] Liste versions :", error.message);
    return [];
  }
  return (data ?? []) as BibleVersionRow[];
}

/** Ici on charge un verset avec sa version pour la page `/bible-strong/[verseId]`. */
export async function fetchBibleVerseById(verseId: string): Promise<BibleVerseWithVersion | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bible_verses")
    .select(
      "id, version_id, book_code, book_title, book_sort, chapter, verse, body_text, created_at, bible_versions ( id, slug, title, language, notes, created_at )",
    )
    .eq("id", verseId)
    .maybeSingle();

  if (error) {
    console.error("[AGAPE Bible] Détail verset :", error.message, verseId);
    return null;
  }
  if (!data) return null;
  return data as unknown as BibleVerseWithVersion;
}

/** Ici on liste les versets d’une version (navigation index). */
export async function fetchVerseSummariesForVersion(versionId: string): Promise<
  Pick<BibleVerseWithVersion, "id" | "book_title" | "chapter" | "verse" | "book_sort">[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bible_verses")
    .select("id, book_title, chapter, verse, book_sort")
    .eq("version_id", versionId)
    .order("book_sort", { ascending: true })
    .order("chapter", { ascending: true })
    .order("verse", { ascending: true })
    .limit(500);

  if (error) {
    console.error("[AGAPE Bible] Liste versets :", error.message);
    return [];
  }
  return (data ?? []) as Pick<BibleVerseWithVersion, "id" | "book_title" | "chapter" | "verse" | "book_sort">[];
}
