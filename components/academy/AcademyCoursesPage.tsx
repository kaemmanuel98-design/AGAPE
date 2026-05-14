import { getTranslations } from "next-intl/server";

import { AcademyCatalogWithFilters } from "@/components/academy/academy-catalog-with-filters";
import { AcademyFeatured } from "@/components/academy/AcademyFeatured";
import { sortAcademyCoursesForCatalog } from "@/lib/academy/catalog-sort";
import type { LessonRow } from "@/lib/academy/types";
import { createClient } from "@/utils/supabase/server";

/** Couleurs centralisées (Tailwind) — fond blanc pour le pilier Academy. */
const shell = "min-h-[60vh] bg-white px-4 py-8 md:px-8 md:py-12";
const titleClass = "text-3xl font-bold tracking-tight text-slate-900 md:text-4xl";
const taglineClass = "mt-2 max-w-2xl text-slate-600";
const emptyBox =
  "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-8 py-16 text-center";
const errorBox =
  "rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-rose-900";

/**
 * Ici on récupère tous les cours Academy depuis Supabase, on les trie pour le catalogue,
 * puis on affiche le bloc « À la une » et la grille filtrable par `catalog_category`.
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
        <div className={shell}>
          <div className={errorBox}>
            <p className="font-semibold">{t("fetchError")}</p>
            <p className="mt-2 text-sm opacity-90">{t("errorGeneric")}</p>
          </div>
        </div>
      );
    }

    const rows = sortAcademyCoursesForCatalog((courses ?? []) as LessonRow[]);
    const featuredLesson = rows.find((r) => r.is_featured === true) ?? null;
    const gridRows = featuredLesson ? rows.filter((r) => r.id !== featuredLesson.id) : rows;

    if (rows.length === 0) {
      return (
        <div className={shell}>
          <header className="mb-10">
            <h1 className={titleClass}>{t("introTitle")}</h1>
            <p className={taglineClass}>{t("pageTagline")}</p>
          </header>
          <div className={emptyBox}>
            <p className="text-lg font-medium text-slate-700">{t("contentArrivingSoon")}</p>
            <p className="mt-2 max-w-md text-sm text-slate-500">{t("empty")}</p>
          </div>
        </div>
      );
    }

    return (
      <div className={shell}>
        <header className="mb-10">
          <h1 className={titleClass}>{t("introTitle")}</h1>
          <p className={taglineClass}>{t("pageTagline")}</p>
        </header>

        {featuredLesson ? (
          <div className="mb-10">
            <AcademyFeatured lesson={featuredLesson} />
          </div>
        ) : null}

        <AcademyCatalogWithFilters chipSource={rows} gridCourses={gridRows} />
      </div>
    );
  } catch (e) {
    console.error("[AGAPE Academy] Exception lors du chargement du catalogue :", e);
    return (
      <div className={shell}>
        <div className={errorBox}>
          <p className="font-semibold">{t("fetchError")}</p>
          <p className="mt-2 text-sm opacity-90">{t("errorGeneric")}</p>
        </div>
      </div>
    );
  }
}
