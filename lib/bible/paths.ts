/** Chemins publics Bible Strong (sans préfixe de locale). */
export function bibleVersionPath(versionSlug: string) {
  return `/bible-strong/v/${encodeURIComponent(versionSlug)}`;
}

export function bibleBookPath(versionSlug: string, bookCode: string) {
  return `/bible-strong/v/${encodeURIComponent(versionSlug)}/${encodeURIComponent(bookCode)}`;
}

export function bibleChapterPath(versionSlug: string, bookCode: string, chapter: number) {
  return `${bibleBookPath(versionSlug, bookCode)}/${chapter}`;
}

export function bibleVersePath(verseId: string) {
  return `/bible-strong/${verseId}`;
}

export function bibleLexiconPath(code: string, params?: { version?: string; from?: string }) {
  const q = new URLSearchParams();
  if (params?.version) q.set("v", params.version);
  if (params?.from) q.set("from", params.from);
  const qs = q.toString();
  return `/bible-strong/lexicon/${encodeURIComponent(code)}${qs ? `?${qs}` : ""}`;
}
