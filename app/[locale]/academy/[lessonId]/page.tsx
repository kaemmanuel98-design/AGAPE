import { ArrowLeft, BookOpenText, ExternalLink, Headphones, PlayCircle } from "lucide-react";
import { notFound } from "next/navigation";

import { AccessibleAudioPlayer } from "@/components/audio/accessible-audio-player";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getLessonById } from "@/lib/academy/queries";
import { getLessonVideoEmbedUrl } from "@/lib/academy/video";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = await getLessonById(lessonId);

  if (!lesson) {
    notFound();
  }

  const embedUrl = getLessonVideoEmbedUrl(lesson.video_url);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" asChild className="rounded-full">
          <Link href="/academy" className="gap-2">
            <ArrowLeft className="size-4" />
            Retour à l&apos;Academy
          </Link>
        </Button>
        <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {lesson.level}
        </span>
      </div>

      <section className="space-y-6 rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {lesson.module_title}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {lesson.title}
            </h1>
          </div>
          <div className="flex size-14 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow">
            {lesson.content_kind === "video" ? (
              <PlayCircle className="size-7" />
            ) : lesson.content_kind === "audio" ? (
              <Headphones className="size-7" />
            ) : (
              <BookOpenText className="size-7" />
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-border bg-background/55 p-5">
          <p className="mb-3 text-sm font-medium text-foreground">Écouter la leçon</p>
          <AccessibleAudioPlayer
            audioUrl={lesson.audio_url}
            ttsText={lesson.text_content}
            buttonLabel="Ouvrir le lecteur audio"
            ttsLabel="Lire avec la synthèse vocale"
          />
        </div>

        {lesson.content_kind === "video" && lesson.video_url ? (
          <div className="space-y-4 rounded-[24px] border border-border bg-background/55 p-5">
            <div className="flex items-center gap-2 text-foreground">
              <PlayCircle className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Vidéo</h2>
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
                <ExternalLink className="size-4" />
                Ouvrir la vidéo
              </a>
            )}
          </div>
        ) : null}

        {lesson.text_content ? (
          <article className="space-y-4 rounded-[24px] border border-border bg-background/55 p-6 text-foreground">
            {lesson.text_content.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index} className="whitespace-pre-wrap leading-8 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </article>
        ) : lesson.content_kind !== "video" ? (
          <div className="rounded-[24px] border border-border bg-background/55 p-6 text-sm text-muted-foreground">
            Cette leçon est principalement pensée pour l&apos;écoute.
          </div>
        ) : null}
      </section>
    </div>
  );
}
