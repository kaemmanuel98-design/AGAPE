import { ArrowLeft, BookMarked, BookOpenText, ExternalLink, Headphones, PlayCircle } from "lucide-react";
import { Merriweather } from "next/font/google";
import { getTranslations } from "next-intl/server";

import { AcademyBookReadingSheet } from "@/components/academy/academy-book-reading-sheet";
import { BookReader } from "@/components/academy/BookReader";
import { MarkdownLessonBody } from "@/components/academy/markdown-lesson-body";
import { AccessibleAudioPlayer } from "@/components/audio/accessible-audio-player";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { isGynoskoLesson } from "@/lib/academy/gynosko";
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
 * — Livres GYNOSKO : `BookReader` (fond crème, serif).
 * — Autres livres : `AcademyBookReadingSheet`.
 * — Texte principal : champ Supabase `text_content` (contenu éditorial / « content » métier), rendu en Markdown.
 */
export async function AcademyLessonDocument({ lesson }: Props) {
  const t = await getTranslations("academy");

  if (lesson.content_kind === "livre") {
    return isGynoskoLesson(lesson) ? <BookReader lesson={lesson} /> : <AcademyBookReadingSheet lesson={lesson} />;
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
        <Button variant="outline" asChild className="w-fit rounded-full">
          <Link href="/academy" className="gap-2">
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            {t("backToAcademy")}
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{t("lessonBrand")}</span>
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">{lesson.level}</span>
        </div>
      </div>

      <section className="space-y-8 rounded-[var(--radius)] border border-border bg-card/50 p-6 shadow-lg backdrop-blur-md sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{lesson.module_title}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{lesson.title}</h1>
          </div>
          <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow" aria-hidden>
            {kindIcon(lesson.content_kind)}
          </div>
        </div>

        {isVideoLesson && lesson.video_url ? (
          <div className="space-y-4 rounded-[24px] border border-border bg-background/55 p-5">
            <div className="flex items-center gap-2 text-foreground">
              <PlayCircle className="size-5 text-primary" aria-hidden />
              <h2 className="text-lg font-semibold">{t("videoHeading")}</h2>
            </div>
            {embedUrl ? (
              <div className="overflow-hidden rounded-[20px] border border-border">
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
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <ExternalLink className="size-4 shrink-0" aria-hidden />
                {t("openVideo")}
              </a>
            )}
          </div>
        ) : null}

        {showVideoDescription ? (
          <div className="rounded-[24px] border border-border bg-background/55 p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t("descriptionHeading")}</h2>
            <MarkdownLessonBody markdown={lesson.text_content!} variant="muted" />
          </div>
        ) : null}

        {showSerifArticle ? (
          <article
            className={`${articleSerif.className} rounded-[24px] border border-border bg-background/80 px-5 py-8 sm:px-10 sm:py-10`}
          >
            <MarkdownLessonBody markdown={lesson.text_content!} variant="article" />
          </article>
        ) : null}

        {!hasText && !isVideoLesson ? (
          <div className="rounded-[24px] border border-border bg-background/55 p-6 text-sm text-muted-foreground">{t("listenOnlyHint")}</div>
        ) : null}

        <div className="rounded-[24px] border border-border bg-background/55 p-5">
          <p className="mb-3 text-sm font-medium text-foreground">{t("listenHeading")}</p>
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
