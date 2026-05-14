import { getTranslations } from "next-intl/server";

import CourseCard from "@/components/CourseCard";
import { sortAcademyCoursesForCatalog } from "@/lib/academy/gynosko";
import type { LessonRow } from "@/lib/academy/types";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function AcademyPage() {
  const t = await getTranslations("academy");

  /**
   * Client Supabase SSR (clé anon, cookies) — source unique : `@/utils/supabase/server`.
   * Aucune session utilisateur n’est exigée : la lecture repose sur les politiques RLS `SELECT` publiques.
   */
  const supabase = await createClient();

  /**
   * --- Appel SQL ---
   * `SELECT *` sur `public.academy_courses`
   * `ORDER BY is_featured DESC` pour remonter les contenus mis en avant (ex. GYNOSKO coché en admin).
   * Le tri final côté application (`sortAcademyCoursesForCatalog`) place ensuite GYNOSKO en tête
   * parmi les non-featured si besoin.
   */
  const { data: courses, error } = await supabase
    .from("academy_courses")
    .select("*")
    .order("is_featured", { ascending: false });

  if (error) {
    console.error("Erreur backend AGAPE (academy_courses):", error.message);
    return (
      <div className="p-10 text-center text-slate-700 dark:text-slate-200">
        {t("loadCoursesError")}
      </div>
    );
  }

  const rows = sortAcademyCoursesForCatalog((courses ?? []) as LessonRow[]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 dark:bg-slate-950">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">{t("introTitle")}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{t("pageTagline")}</p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
          <p>{t("contentArrivingSoon")}</p>
        </div>
      ) : null}
    </main>
  );
}
