/** Ligne `bible_versions` (métadonnées d’une traduction ou édition). */
export type BibleVersionRow = {
  id: string;
  slug: string;
  title: string;
  language: string;
  notes: string | null;
  created_at: string;
};

/** Ligne `bible_verses` : un verset éditable dans Supabase. */
export type BibleVerseRow = {
  id: string;
  version_id: string;
  book_code: string;
  book_title: string;
  book_sort: number;
  chapter: number;
  verse: number;
  body_text: string;
  created_at: string;
};

export type BibleVerseWithVersion = BibleVerseRow & {
  bible_versions: BibleVersionRow | null;
};
