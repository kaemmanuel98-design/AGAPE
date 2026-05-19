import "server-only";

import type {
  BibleBookSummary,
  BibleChapterSummary,
  BibleVerseRow,
  BibleVerseWithVersion,
  BibleVersionRow,
} from "@/lib/bible/types";
import { createClient } from "@/utils/supabase/server";

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

export async function fetchBibleVersionBySlug(slug: string): Promise<BibleVersionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bible_versions")
    .select("id, slug, title, language, notes, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[AGAPE Bible] Version par slug :", error.message, slug);
    return null;
  }
  return (data ?? null) as BibleVersionRow | null;
}

export async function fetchBooksForVersion(versionId: string): Promise<BibleBookSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bible_books_by_version")
    .select("version_id, book_code, book_title, book_sort, max_chapter, verse_count")
    .eq("version_id", versionId)
    .order("book_sort", { ascending: true });

  if (error) {
    console.error("[AGAPE Bible] Livres :", error.message);
    return [];
  }
  return (data ?? []) as BibleBookSummary[];
}

export async function fetchChaptersForBook(
  versionId: string,
  bookCode: string,
): Promise<BibleChapterSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bible_chapters_by_version")
    .select("version_id, book_code, chapter, verse_count")
    .eq("version_id", versionId)
    .eq("book_code", bookCode)
    .order("chapter", { ascending: true });

  if (error) {
    console.error("[AGAPE Bible] Chapitres :", error.message, bookCode);
    return [];
  }
  return (data ?? []) as BibleChapterSummary[];
}

export async function fetchChapterVerses(
  versionId: string,
  bookCode: string,
  chapter: number,
): Promise<BibleVerseRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bible_verses")
    .select("id, version_id, book_code, book_title, book_sort, chapter, verse, body_text, created_at")
    .eq("version_id", versionId)
    .eq("book_code", bookCode)
    .eq("chapter", chapter)
    .order("verse", { ascending: true });

  if (error) {
    console.error("[AGAPE Bible] Versets du chapitre :", error.message, bookCode, chapter);
    return [];
  }
  return (data ?? []) as BibleVerseRow[];
}

export async function fetchBookMeta(
  versionId: string,
  bookCode: string,
): Promise<Pick<BibleBookSummary, "book_title" | "book_sort" | "max_chapter"> | null> {
  const books = await fetchBooksForVersion(versionId);
  const book = books.find((b) => b.book_code === bookCode);
  if (!book) return null;
  return {
    book_title: book.book_title,
    book_sort: book.book_sort,
    max_chapter: book.max_chapter,
  };
}

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

/** @deprecated Préférer la navigation livre → chapitre. Conservé pour compatibilité. */
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
