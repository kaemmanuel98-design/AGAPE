"use client";

import NextLink from "next/link";
import { BookMarked, BookOpenText, Headphones, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { LessonKind, LessonRow } from "@/lib/academy/types";
import { cn } from "@/lib/utils";

function lessonTypeBadgeLabel(kind: LessonKind, t: ReturnType<typeof useTranslations<"academy">>) {
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

function CourseTypeIcon({ kind }: { kind: LessonKind }) {
  const common = "size-4 shrink-0";
  if (kind === "video") return <PlayCircle className={cn(common, "text-violet-200")} aria-hidden />;
  if (kind === "audio") return <Headphones className={cn(common, "text-emerald-200")} aria-hidden />;
  if (kind === "livre") return <BookMarked className={cn(common, "text-amber-200")} aria-hidden />;
  return <BookOpenText className={cn(common, "text-sky-200")} aria-hidden />;
}

type Props = {
  course: LessonRow;
};

/** Carte cours / livre Academy (lien vers la page détail). */
export function CourseCard({ course }: Props) {
  const t = useTranslations("academy");

  if (course.content_kind === "livre") {
    return (
      <article className="flex h-full flex-col overflow-hidden rounded-[24px] border border-amber-500/20 bg-gradient-to-b from-amber-950/40 to-slate-950/80 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        <div className="relative mx-auto flex w-full max-w-[11.5rem] flex-1 flex-col">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.5)] ring-1 ring-black/30">
            {course.cover_image?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL publique saisie en admin.
              <img src={course.cover_image} alt="" className="size-full object-cover" loading="lazy" />
            ) : (
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                <BookMarked className="size-12 text-slate-600" aria-hidden />
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100/90">
              <CourseTypeIcon kind="livre" />
              {lessonTypeBadgeLabel("livre", t)}
            </span>
            <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {course.level}
            </span>
          </div>
          <h2 className="mt-3 text-center text-base font-semibold leading-snug tracking-tight text-slate-50">{course.title}</h2>
          {course.author?.trim() ? <p className="mt-1 text-center text-sm text-slate-400">{course.author}</p> : null}
          <p className="mt-1 text-center text-[10px] font-medium uppercase tracking-wide text-slate-600">{course.module_title}</p>
        </div>
        <div className="mt-5">
          <Button asChild className="w-full rounded-xl bg-amber-600/90 hover:bg-amber-600">
            <NextLink href={`/academy/${course.id}`} className="inline-flex items-center justify-center gap-2">
              <CourseTypeIcon kind="livre" />
              {t("viewBook")}
            </NextLink>
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-white/12 bg-gradient-to-b from-white/10 to-white/[0.04] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.25)] backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-100">
          <CourseTypeIcon kind={course.content_kind} />
          {lessonTypeBadgeLabel(course.content_kind, t)}
        </span>
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {course.level}
        </span>
      </div>
      <h2 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-slate-50">{course.title}</h2>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{course.module_title}</p>
      <div className="mt-auto pt-6">
        <Button asChild className="w-full rounded-xl sm:w-auto">
          <NextLink href={`/academy/${course.id}`} className="inline-flex items-center justify-center gap-2">
            <CourseTypeIcon kind={course.content_kind} />
            {t("viewCourse")}
          </NextLink>
        </Button>
      </div>
    </article>
  );
}
