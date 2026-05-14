import NextLink from "next/link";
import { ArrowLeft, BookMarked, BookOpenText, ExternalLink, Headphones, PlayCircle } from "lucide-react";
import { Merriweather } from "next/font/google";
import { getTranslations } from "next-intl/server";

import { AcademyBookReadingSheet } from "@/components/academy/academy-book-reading-sheet";
import { MarkdownLessonBody } from "@/components/academy/markdown-lesson-body";
import { AccessibleAudioPlayer } from "@/components/audio/accessible-audio-player";
import { Button } from "@/components/ui/button";
import type { LessonKind, LessonRow } from "@/lib/academy/types";
import { getLessonVideoEmbedUrl } from "@/lib/academy/video";

/** Police serif pour le corps des articles (contenu collé dans `text_content` côté admin). */
const articleSerif = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

function kindIcon(kind: LessonKind) {
  if (kind === "video") return <PlayCircle className="size-7" aria-hidden />;
  if (kind === "audio") return <Headphones className="size-7" aria-hidden />;
  if (kind === "livre") return <BookMarked className="size-7" aria-hidden />;
  return <BookOpenText className="size-7" aria-hidden />;
}

type Props = {
  lesson: LessonRow;
};

/**
 * Corps de page partagé entre `/[locale]/academy/[lessonId]` et `/academy/[id]`.
 * — Livres (`content_kind === "livre"`) : fiche de lecture standard `AcademyBookReadingSheet`.
 * — Autres types : vidéo, article, audio avec `text_content` rendu en Markdown.
 */
export async function AcademyLessonDocument({ lesson }: Props) {
  const t = await getTranslations("academy");

  if (lesson.content_kind === "livre") {
    return <AcademyBookReadingSheet lesson={lesson} />;
  }

  const embedUrl = getLessonVideoEmbedUrl(lesson.video_url);
  const hasText = Boolean(lesson.text_content?.trim());

  const isVideoLesson = lesson.content_kind === "video";
  const isArticleLesson = lesson.content_kind === "text" || lesson.content_kind === "article";
  const isAudioLesson = lesson.content_kind === "audio";

  const showSerifArticle = hasText && (isArticleLesson || isAudioLesson);
  const showVideoDescription = isVideoLesson && hasText;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" asChild className="w-fit rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
          <NextLink href="/academy" className="gap-2">
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            {t("backToAcademy")}
          </NextLink>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">{t("lessonBrand")}</span>
          <span className="rounded-full bg-sky-50 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-sky-800">
            {lesson.level}
          </span>
        </div>
      </div>

      <section className="space-y-8 rounded-[var(--radius)] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{lesson.module_title}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{lesson.title}</h1>
          </div>
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-sky-700 text-white shadow"
            aria-hidden
          >
            {kindIcon(lesson.content_kind)}
          </div>
        </div>

        {isVideoLesson && lesson.video_url ? (
          <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <PlayCircle className="size-5 text-sky-700" aria-hidden />
              <h2 className="text-lg font-semibold">{t("videoHeading")}</h2>
            </div>
            {embedUrl ? (
              <div className="overflow-hidden rounded-[20px] border border-slate-200">
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={lesson.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
              >
                <ExternalLink className="size-4 shrink-0" aria-hidden />
                {t("openVideo")}
              </a>
            )}
          </div>
        ) : null}

        {showVideoDescription ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">{t("descriptionHeading")}</h2>
            <MarkdownLessonBody markdown={lesson.text_content!} variant="muted" />
          </div>
        ) : null}

        {showSerifArticle ? (
          <article
            className={`${articleSerif.className} rounded-[24px] border border-slate-200 bg-slate-50/90 px-5 py-8 sm:px-10 sm:py-10`}
          >
            <MarkdownLessonBody markdown={lesson.text_content!} variant="article" />
          </article>
        ) : null}

        {!hasText && !isVideoLesson ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">{t("listenOnlyHint")}</div>
        ) : null}

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="mb-3 text-sm font-medium text-slate-900">{t("listenHeading")}</p>
          <AccessibleAudioPlayer
            audioUrl={lesson.audio_url}
            ttsText={lesson.text_content}
            buttonLabel={t("audioOpenPlayer")}
            ttsLabel={t("audioTtsLabel")}
          />
        </div>
      </section>
    </div>
  );
}
