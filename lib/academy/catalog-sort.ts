import type { LessonRow } from "./types";

/**
 * Ordre d’affichage du catalogue Academy : contenus mis en avant (`is_featured`),
 * puis `sort_order`, niveau, module et date — sans logique spécifique à un titre ou livre donné.
 */
export function sortAcademyCoursesForCatalog(rows: LessonRow[]): LessonRow[] {
  return [...rows].sort((a, b) => {
    const fa = a.is_featured === true ? 1 : 0;
    const fb = b.is_featured === true ? 1 : 0;
    if (fb !== fa) return fb - fa;

    const so = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (so !== 0) return so;

    const level = a.level.localeCompare(b.level, "fr", { sensitivity: "base" });
    if (level !== 0) return level;

    const mod = a.module_title.localeCompare(b.module_title, "fr", { sensitivity: "base" });
    if (mod !== 0) return mod;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
