import "server-only";

import { normalizeStrongCode } from "@/lib/bible/strong-code";
import { isPublicBibleVersion } from "@/lib/bible/version-policy";
import type {
  BibleBookSummary,
  BibleChapterSummary,
  BibleVerseRow,
  BibleVerseWithVersion,
  BibleVersionRow,
} from "@/lib/bible/types";
import { createClient } from "@/utils/supabase/server";

export type StrongVerseContext = {
  id: string;
  version_slug: string;
  version_title: string;
  book_code: string;
  book_title: string;
  chapter: number;
  verse: number;
  snippet: string;
  matched_word: string | null;
};

function filterPublicVersions(rows: BibleVersionRow[]): BibleVersionRow[] {
  return rows.filter((v) => isPublicBibleVersion(v.slug));
}

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
  return filterPublicVersions((data ?? []) as BibleVersionRow[]);
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

function snippetAroundStrong(body: string, code: string): { snippet: string; matched_word: string | null } {
  const re = new RegExp(`(\\S*?)\\[${code}\\]`);
  const m = body.match(re);
  if (!m || m.index === undefined) {
    return { snippet: body.slice(0, 120), matched_word: null };
  }
  const start = Math.max(0, m.index - 40);
  const end = Math.min(body.length, m.index + m[0].length + 60);
  let snippet = body.slice(start, end);
  if (start > 0) snippet = `…${snippet}`;
  if (end < body.length) snippet = `${snippet}…`;
  return { snippet: snippet.replace(/\[[GH]0*\d+\]/g, ""), matched_word: m[1] || null };
}

/** Occurrences du numéro Strong dans les versions publiques (contextes bibliques). */
export async function fetchStrongVerseContexts(
  rawCode: string,
  options?: { versionSlug?: string; limit?: number },
): Promise<StrongVerseContext[]> {
  const code = normalizeStrongCode(rawCode);
  if (!code) return [];

  const supabase = await createClient();
  let versionId: string | null = null;

  if (options?.versionSlug) {
    const version = await fetchBibleVersionBySlug(options.versionSlug);
    versionId = version?.id ?? null;
  }

  let query = supabase
    .from("bible_verses")
    .select(
      "id, book_code, book_title, chapter, verse, body_text, bible_versions!inner ( slug, title )",
    )
    .ilike("body_text", `%[${code}]%`)
    .in("bible_versions.slug", ["lsg", "kjv"])
    .order("book_sort", { ascending: true })
    .order("chapter", { ascending: true })
    .order("verse", { ascending: true })
    .limit(options?.limit ?? 40);

  if (versionId) {
    query = query.eq("version_id", versionId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[AGAPE Bible] Contextes Strong :", error.message, code);
    return [];
  }

  const out: StrongVerseContext[] = [];
  for (const row of data ?? []) {
    const rawVersion = row.bible_versions as { slug: string; title: string } | { slug: string; title: string }[] | null;
    const v = Array.isArray(rawVersion) ? rawVersion[0] : rawVersion;
    if (!v || !isPublicBibleVersion(v.slug)) continue;
    const { snippet, matched_word } = snippetAroundStrong(row.body_text as string, code);
    out.push({
      id: row.id as string,
      version_slug: v.slug,
      version_title: v.title,
      book_code: row.book_code as string,
      book_title: row.book_title as string,
      chapter: row.chapter as number,
      verse: row.verse as number,
      snippet,
      matched_word,
    });
  }
  return out;
}

/** Mots français (ou autre langue) utilisés pour ce Strong dans une version donnée. */
export async function fetchStrongTranslationGlosses(
  rawCode: string,
  versionSlug: string,
  limit = 24,
): Promise<string[]> {
  const code = normalizeStrongCode(rawCode);
  if (!code) return [];

  const contexts = await fetchStrongVerseContexts(code, { versionSlug, limit: 200 });
  const words = new Set<string>();
  for (const ctx of contexts) {
    const w = ctx.matched_word?.trim();
    if (w && w.length < 48) words.add(w);
    if (words.size >= limit) break;
  }
  return [...words];
}
