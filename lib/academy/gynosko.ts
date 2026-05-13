import type { LessonRow } from "@/lib/academy/types";

/**
 * Identifie la fiche « GYNOSKO » pour activer la mise en page `BookReader`.
 * Le titre en base peut contenir des espaces ou une casse différente (ex. « Gynosko »).
 */
export function isGynoskoLesson(lesson: Pick<LessonRow, "title" | "content_kind">): boolean {
  if (lesson.content_kind !== "livre") return false;
  const folded = lesson.title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  return folded.includes("gynosko");
}
