"use client";

import { BookMarked, BookOpenText, Headphones, PlayCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { LessonKind, LessonRow } from "@/lib/academy/types";
import { cn } from "@/lib/utils";

type AcademyFilterTab = "all" | "videos" | "articles" | "books";

function lessonTypeBadgeLabel(
  kind: LessonKind,
  t: ReturnType<typeof useTranslations<"academy">>,
) {
  const key =
    kind === "text"
      ? ("kindLabel.text" as const)
      : kind === "article"
        ? ("kindLabel.article" as const)
        : kind === "video"
          ? ("kindLabel.video" as const)
          : kind === "livre"
            ? ("kindLabel.livre" as const)
            : ("kindLabel.audio" as const);
  return t(key);
}

/** Icône sur la carte : livre physique (bibliothèque), article, lecture vidéo, audio. */
function CourseTypeIcon({ kind }: { kind: LessonKind }) {
  const common = "size-4 shrink-0";
  if (kind === "video") return <PlayCircle className={cn(common, "text-violet-200")} aria-hidden />;
  if (kind === "audio") return <Headphones className={cn(common, "text-emerald-200")} aria-hidden />;
  if (kind === "livre") return <BookMarked className={cn(common, "text-amber-200")} aria-hidden />;
  return <BookOpenText className={cn(common, "text-sky-200")} aria-hidden />;
}

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
          {filtered.map((lesson) =>
            lesson.content_kind === "livre" ? (
              <li key={lesson.id}>
                {/* Carte « format livre » : `cover_image` = URL de la jaquette (voir admin / migration). */}
                <article className="flex h-full flex-col overflow-hidden rounded-[24px] border border-amber-500/20 bg-gradient-to-b from-amber-950/40 to-slate-950/80 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                  <div className="relative mx-auto flex w-full max-w-[11.5rem] flex-1 flex-col">
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.5)] ring-1 ring-black/30">
                      {lesson.cover_image?.trim() ? (
                        // eslint-disable-next-line @next/next/no-img-element -- URL publique saisie en admin (hors domaine figé).
                        <img
                          src={lesson.cover_image}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                          <BookMarked className="size-12 text-slate-600" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100/90">
                        <CourseTypeIcon kind="livre" />
                        {lessonTypeBadgeLabel("livre", t)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        {lesson.level}
                      </span>
                    </div>
                    <h2 className="mt-3 text-center text-base font-semibold leading-snug tracking-tight text-slate-50">{lesson.title}</h2>
                    {lesson.author?.trim() ? (
                      <p className="mt-1 text-center text-sm text-slate-400">{lesson.author}</p>
                    ) : null}
                    <p className="mt-1 text-center text-[10px] font-medium uppercase tracking-wide text-slate-600">{lesson.module_title}</p>
                  </div>
                  <div className="mt-5">
                    <Button asChild className="w-full rounded-xl bg-amber-600/90 hover:bg-amber-600">
                      <Link href={`/academy/${lesson.id}`} className="inline-flex items-center justify-center gap-2">
                        <CourseTypeIcon kind="livre" />
                        {t("viewBook")}
                      </Link>
                    </Button>
                  </div>
                </article>
              </li>
            ) : (
              <li key={lesson.id}>
                <article className="flex h-full flex-col rounded-[24px] border border-white/12 bg-gradient-to-b from-white/10 to-white/[0.04] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.25)] backdrop-blur-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-100">
                      <CourseTypeIcon kind={lesson.content_kind} />
                      {lessonTypeBadgeLabel(lesson.content_kind, t)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {lesson.level}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-slate-50">{lesson.title}</h2>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{lesson.module_title}</p>
                  <div className="mt-auto pt-6">
                    <Button asChild className="w-full rounded-xl sm:w-auto">
                      <Link href={`/academy/${lesson.id}`} className="inline-flex items-center justify-center gap-2">
                        <CourseTypeIcon kind={lesson.content_kind} />
                        {t("viewCourse")}
                      </Link>
                    </Button>
                  </div>
                </article>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
