"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { CourseCard } from "@/components/academy/course-card";
import type { LessonRow } from "@/lib/academy/types";
import { cn } from "@/lib/utils";

type AcademyFilterTab = "all" | "videos" | "articles" | "books";

function matchesFilterTab(lesson: LessonRow, tab: AcademyFilterTab) {
  if (tab === "all") return true;
  if (tab === "videos") return lesson.content_kind === "video";
  if (tab === "articles") return lesson.content_kind === "text" || lesson.content_kind === "article";
  if (tab === "books") return lesson.content_kind === "livre";
  return true;
}

type Props = {
  lessons: LessonRow[];
  /** Retire une entrée de la grille (ex. livre déjà affiché dans « À la une »). */
  excludeLessonId?: string | null;
};

/**
 * Grille Academy + recherche + onglets [Tous | Vidéos | Articles | Livres].
 * Les entrées `livre` utilisent une carte « format livre » (couverture dominante + auteur).
 */
export function AcademyCoursesExplorer({ lessons, excludeLessonId }: Props) {
  const t = useTranslations("academy");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<AcademyFilterTab>("all");

  const filtered = useMemo(() => {
    const base = excludeLessonId ? lessons.filter((l) => l.id !== excludeLessonId) : lessons;
    const q = query.trim().toLowerCase();
    return base.filter((l) => {
      if (!matchesFilterTab(l, tab)) return false;
      if (!q) return true;
      const author = l.author?.toLowerCase() ?? "";
      const hay = `${l.title} ${l.module_title} ${l.level} ${author}`.toLowerCase();
      return hay.includes(q);
    });
  }, [lessons, query, tab, excludeLessonId]);

  const tabBtn = (id: AcademyFilterTab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      className={cn(
        "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition sm:text-sm",
        tab === id
          ? "border-sky-400/50 bg-sky-500/20 text-sky-50 shadow-inner"
          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Filtres par type de contenu (onglets). */}
      <div className="flex flex-wrap gap-2">
        {tabBtn("all", t("filterAll"))}
        {tabBtn("videos", t("filterVideos"))}
        {tabBtn("articles", t("filterArticles"))}
        {tabBtn("books", t("filterBooks"))}
      </div>

      {/* Barre de recherche : filtre sur titre, module, niveau, auteur (livres). */}
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-11 w-full rounded-2xl border border-white/15 bg-white/5 py-2 pl-10 pr-4 text-sm text-slate-100 outline-none ring-sky-400/30 placeholder:text-slate-500 focus:ring-2"
          autoComplete="off"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-10 text-center text-sm text-slate-300">
          {t("noResults")}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lesson) => (
            <li key={lesson.id}>
              <CourseCard course={lesson} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
