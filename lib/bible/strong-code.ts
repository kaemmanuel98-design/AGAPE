/** Normalise H0430 → H430, G2316 → G2316 pour le lexique Open Scriptures. */
export function normalizeStrongCode(raw: string): string | null {
  const m = raw.trim().toUpperCase().match(/^([GH])0*(\d+)$/);
  if (!m) return null;
  return `${m[1]}${m[2]}`;
}
