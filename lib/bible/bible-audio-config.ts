/** Chemin public d’un enregistrement audio pour un chapitre entier (optionnel). */
export function chapterAudioPublicPath(
  versionSlug: string,
  bookCode: string,
  chapter: number,
): string {
  return `/audio/bible/${encodeURIComponent(versionSlug)}/${encodeURIComponent(bookCode)}/${chapter}.mp3`;
}

/** Échantillon vocal de référence (clonage ElevenLabs). */
export const NARRATOR_REFERENCE_PUBLIC_PATH = "/audio/bible/narrator-reference.ogg";
