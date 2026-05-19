/** Versions obsolètes ou doublons — masquées dans l’UI, supprimées à l’import. */
export const DEPRECATED_BIBLE_VERSION_SLUGS = ["kjv-strong", "sample", "demo", "exemple"] as const;

export function isPublicBibleVersion(slug: string): boolean {
  return !DEPRECATED_BIBLE_VERSION_SLUGS.includes(
    slug as (typeof DEPRECATED_BIBLE_VERSION_SLUGS)[number],
  );
}
