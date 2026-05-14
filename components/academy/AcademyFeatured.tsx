import NextLink from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import type { LessonRow } from "@/lib/academy/types";

type Props = {
  /** Entrée `academy_courses` avec `is_featured` (mise en avant configurable en admin). */
  lesson: LessonRow;
};

/**
 * Bloc « À la une » : carte claire (pilier Academy sur fond blanc).
 */
export async function AcademyFeatured({ lesson }: Props) {
  const t = await getTranslations("academy");

  return (
    <section
      aria-labelledby="academy-featured-kicker academy-featured-heading"
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50/40 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
    >
      <div className="relative flex flex-col gap-8 p-7 sm:flex-row sm:items-stretch sm:gap-10 sm:p-10 lg:p-12">
        <div className="flex min-w-0 flex-1 flex-col justify-center space-y-4">
          <p
            id="academy-featured-kicker"
            className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700"
          >
            {t("featuredSectionTitle")}
          </p>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{lesson.module_title}</p>

          <h2
            id="academy-featured-heading"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            {lesson.title}
          </h2>

          <p className="max-w-xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
            {t("featuredSpotLead")}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-sky-900">
              <Sparkles className="size-3.5 shrink-0 text-sky-600" aria-hidden />
              {t("featuredBadge")}
            </span>
          </div>

          <div className="pt-2">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-slate-900 px-10 text-base font-semibold text-white shadow-md hover:bg-slate-800"
            >
              <NextLink href={`/academy/${lesson.id}`} className="inline-flex items-center gap-2">
                {t("featuredCta")}
                <ArrowRight className="size-5 shrink-0" aria-hidden />
              </NextLink>
            </Button>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center sm:w-[min(100%,20rem)] lg:w-[22rem]">
          {lesson.cover_image?.trim() ? (
            <div className="w-full max-w-[14rem] overflow-hidden rounded-2xl border border-slate-200 shadow-md sm:max-w-none">
              {/* eslint-disable-next-line @next/next/no-img-element -- URL dynamique (admin / CDN). */}
              <img
                src={lesson.cover_image}
                alt=""
                className="aspect-[2/3] w-full object-cover"
                loading="eager"
              />
            </div>
          ) : (
            <div
              className="flex aspect-[2/3] w-full max-w-[14rem] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 sm:max-w-none"
              aria-hidden
            >
              {t("bookCoverPlaceholder")}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
