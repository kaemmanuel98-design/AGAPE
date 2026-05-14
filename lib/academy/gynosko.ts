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

/**
 * Ordre d’affichage catalogue Academy : d’abord `is_featured`, puis le livre GYNOSKO,
 * puis le reste (stable via `sort_order` puis titre).
 */
export function sortAcademyCoursesForCatalog(rows: LessonRow[]): LessonRow[] {
  const rank = (row: LessonRow) => {
    if (row.is_featured === true) return 2;
    if (isGynoskoLesson(row)) return 1;
    return 0;
  };

  return [...rows].sort((a, b) => {
    const d = rank(b) - rank(a);
    if (d !== 0) return d;
    const so = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (so !== 0) return so;
    return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
  });
}
