import { BookOpenText } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AcademyCoursesExplorer } from "@/components/academy/academy-courses-explorer";
import { AcademyFeatured } from "@/components/academy/AcademyFeatured";
import { isGynoskoLesson } from "@/lib/academy/gynosko";
import { listAllLessons } from "@/lib/academy/queries";

export const dynamic = "force-dynamic";

export default async function AcademyPage() {
  const lessons = await listAllLessons();
  const t = await getTranslations("academy");
  const featuredGynosko = lessons.find((l) => isGynoskoLesson(l));

  return (
    <div className="space-y-10 pb-16">
      {/* À la une : carte GYNOSKO — composant `AcademyFeatured.tsx` (dégradé, texte d’accroche). */}
      {featuredGynosko ? <AcademyFeatured lesson={featuredGynosko} /> : null}

      <section className="agape-brand-surface rounded-[var(--radius)] p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#7CC6FF] shadow-inner">
            <BookOpenText className="size-6" />
          </div>
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl md:text-4xl">{t("introTitle")}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">{t("introBody")}</p>
          </div>
        </div>
      </section>

      {lessons.length === 0 ? (
        <section className="rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md">
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </section>
      ) : (
        <section className="agape-brand-surface rounded-[var(--radius)] p-6 sm:p-8">
          <AcademyCoursesExplorer lessons={lessons} excludeLessonId={featuredGynosko?.id} />
        </section>
      )}
    </div>
  );
}
