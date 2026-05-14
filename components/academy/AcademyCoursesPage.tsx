import { getTranslations } from "next-intl/server";

import CourseCard from "@/components/CourseCard";
import { AcademyFeatured } from "@/components/academy/AcademyFeatured";
import { sortAcademyCoursesForCatalog } from "@/lib/academy/catalog-sort";
import type { LessonRow } from "@/lib/academy/types";
import { createClient } from "@/utils/supabase/server";

/** Couleurs centralisées (Tailwind) — modifie ces classes pour changer le thème de la liste Academy. */
const shell = "min-h-screen bg-slate-50 p-6 md:p-12 dark:bg-slate-950";
const titleClass = "text-4xl font-bold text-slate-900 dark:text-slate-50";
const taglineClass = "mt-2 text-slate-600 dark:text-slate-400";
const emptyBox =
  "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-8 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40";
const errorBox =
  "rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100";

/**
 * Ici on récupère tous les cours Academy depuis Supabase, on les trie pour l’affichage catalogue,
 * puis on rend la grille (avec bloc « À la une » si une ligne est marquée `is_featured`).
 */
export async function AcademyCoursesPage() {
  const t = await getTranslations("academy");

  try {
    const supabase = await createClient();
    const { data: courses, error } = await supabase
      .from("academy_courses")
      .select("*")
      .order("is_featured", { ascending: false });

    if (error) {
      console.error("[AGAPE Academy] Erreur Supabase (liste cours) :", error.message);
      return (
        <main className={shell}>
          <div className={errorBox}>
            <p className="font-semibold">{t("fetchError")}</p>
            <p className="mt-2 text-sm opacity-90">{error.message}</p>
          </div>
        </main>
      );
    }

    const rows = sortAcademyCoursesForCatalog((courses ?? []) as LessonRow[]);
    const featuredLesson = rows.find((r) => r.is_featured === true) ?? null;
    const gridRows = featuredLesson ? rows.filter((r) => r.id !== featuredLesson.id) : rows;

    if (rows.length === 0) {
      return (
        <main className={shell}>
          <header className="mb-12">
            <h1 className={titleClass}>{t("introTitle")}</h1>
            <p className={taglineClass}>{t("pageTagline")}</p>
          </header>
          <div className={emptyBox}>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200">{t("contentArrivingSoon")}</p>
            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{t("empty")}</p>
          </div>
        </main>
      );
    }

    return (
      <main className={shell}>
        <header className="mb-12">
          <h1 className={titleClass}>{t("introTitle")}</h1>
          <p className={taglineClass}>{t("pageTagline")}</p>
        </header>

        {featuredLesson ? (
          <div className="mb-12">
            <AcademyFeatured lesson={featuredLesson} />
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {gridRows.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </main>
    );
  } catch (e) {
    console.error("[AGAPE Academy] Exception lors du chargement du catalogue :", e);
    return (
      <main className={shell}>
        <div className={errorBox}>
          <p className="font-semibold">{t("fetchError")}</p>
          <p className="mt-2 text-sm opacity-90">{t("errorGeneric")}</p>
        </div>
      </main>
    );
  }
}
