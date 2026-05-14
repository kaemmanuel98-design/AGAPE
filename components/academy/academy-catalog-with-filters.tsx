"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import CourseCard from "@/components/CourseCard";
import type { LessonRow } from "@/lib/academy/types";
import { cn } from "@/lib/utils";

type Props = {
  /** Tous les cours (y compris à la une) : sert à construire les pastilles de catégorie. */
  chipSource: LessonRow[];
  /** Cours affichés dans la grille (souvent sans la ligne « à la une »). */
  gridCourses: LessonRow[];
};

/**
 * Grille Academy + pastilles de filtre basées sur `catalog_category` (donnée Supabase).
 */
export function AcademyCatalogWithFilters({ chipSource, gridCourses }: Props) {
  const t = useTranslations("academy");
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of chipSource) {
      const cat = (c as LessonRow & { catalog_category?: string }).catalog_category ?? "communaute";
      set.add(cat);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [chipSource]);

  const [active, setActive] = useState<string | "all">("all");

  const filteredGrid = useMemo(() => {
    if (active === "all") return gridCourses;
    return gridCourses.filter(
      (c) => ((c as LessonRow & { catalog_category?: string }).catalog_category ?? "communaute") === active,
    );
  }, [gridCourses, active]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            active === "all"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
          )}
        >
          {t("filterAll")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === cat
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredGrid.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center">
          <p className="text-lg font-medium text-slate-700">{t("noResultsCategory")}</p>
          <button
            type="button"
            className="mt-4 text-sm font-semibold text-sky-700 underline-offset-2 hover:underline"
            onClick={() => setActive("all")}
          >
            {t("filterAll")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredGrid.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
