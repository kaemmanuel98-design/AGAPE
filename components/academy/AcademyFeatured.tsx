import { ArrowRight, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { LessonRow } from "@/lib/academy/types";

type Props = {
  /** Entrée `academy_courses` avec `is_featured` (mise en avant configurable en admin). */
  lesson: LessonRow;
};

/**
 * Bloc « À la une » en tête du catalogue Academy : titre et métadonnées issus de Supabase.
 */
export async function AcademyFeatured({ lesson }: Props) {
  const t = await getTranslations("academy");

  return (
    <section
      aria-labelledby="academy-featured-kicker academy-featured-heading"
      className="relative overflow-hidden rounded-[var(--radius)] border border-white/10 shadow-[0_24px_80px_rgba(15,23,42,0.45)] ring-1 ring-amber-400/15"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#152238] to-[#3a2f14] dark:from-[#050d18] dark:via-[#0f172a] dark:to-[#2a1f0a]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-1/2 size-[28rem] -translate-y-1/2 rounded-full bg-amber-400/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-sky-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-8 p-7 sm:flex-row sm:items-stretch sm:gap-10 sm:p-10 lg:p-12">
        <div className="flex min-w-0 flex-1 flex-col justify-center space-y-5">
          <p
            id="academy-featured-kicker"
            className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/85"
          >
            {t("featuredSectionTitle")}
          </p>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100/80">{lesson.module_title}</p>

          <h2
            id="academy-featured-heading"
            className="font-serif text-4xl font-bold tracking-tight text-[#FDFBF7] drop-shadow-sm sm:text-5xl lg:text-6xl"
          >
            {lesson.title}
          </h2>

          <p className="max-w-xl text-[18px] font-medium leading-relaxed text-slate-100/95 sm:text-xl lg:text-2xl">
            {t("featuredSpotLead")}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-500/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-100">
              <Sparkles className="size-3.5 shrink-0" aria-hidden />
              {t("featuredBadge")}
            </span>
          </div>

          <div className="pt-2">
            <Button
              asChild
              size="lg"
              className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-amber-600 px-10 text-base font-semibold text-slate-950 shadow-lg shadow-amber-900/25 hover:from-amber-400 hover:to-amber-500"
            >
              <Link href={`/academy/${lesson.id}`} className="inline-flex items-center gap-2">
                {t("featuredCta")}
                <ArrowRight className="size-5 shrink-0" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center sm:w-[min(100%,20rem)] lg:w-[22rem]">
          {lesson.cover_image?.trim() ? (
            <div className="w-full max-w-[14rem] overflow-hidden rounded-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1 ring-amber-200/20 sm:max-w-none">
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
              className="flex aspect-[2/3] w-full max-w-[14rem] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-slate-300 sm:max-w-none"
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
