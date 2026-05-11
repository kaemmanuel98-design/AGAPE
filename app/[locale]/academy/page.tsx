import { BookOpenText, Headphones, PlayCircle } from "lucide-react";

import { AccessibleAudioPlayer } from "@/components/audio/accessible-audio-player";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { listAllLessons } from "@/lib/academy/queries";
import type { LessonRow } from "@/lib/academy/types";

export const dynamic = "force-dynamic";

function groupLessons(lessons: LessonRow[]) {
  const grouped = new Map<string, Map<string, LessonRow[]>>();

  for (const lesson of lessons) {
    const levelGroup = grouped.get(lesson.level) ?? new Map<string, LessonRow[]>();
    const moduleGroup = levelGroup.get(lesson.module_title) ?? [];
    moduleGroup.push(lesson);
    levelGroup.set(lesson.module_title, moduleGroup);
    grouped.set(lesson.level, levelGroup);
  }

  return grouped;
}

function lessonSummary(lesson: LessonRow) {
  if (lesson.text_content) {
    return `${lesson.text_content.slice(0, 160)}${lesson.text_content.length > 160 ? "…" : ""}`;
  }
  if (lesson.content_kind === "video") {
    return "Leçon vidéo avec lecture guidée et écoute audio si disponible.";
  }
  return "Leçon pensée pour une écoute simple, même sans lecture.";
}

export default async function AcademyPage() {
  const lessons = await listAllLessons();
  const grouped = groupLessons(lessons);

  return (
    <div className="space-y-8 pb-12">
      <section className="space-y-5 rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
            <BookOpenText className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Academy
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Les modules sont rangés par niveau. Chaque leçon peut être lue et écoutée grâce
              à un lecteur audio intégré ou à la synthèse vocale.
            </p>
          </div>
        </div>
      </section>

      {lessons.length === 0 ? (
        <section className="rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md">
          <p className="text-sm text-muted-foreground">
            Aucun cours n&apos;est encore publié. Ajoute la première leçon dans l&apos;admin.
          </p>
        </section>
      ) : null}

      {[...grouped.entries()].map(([level, modules]) => (
        <section
          key={level}
          className="space-y-5 rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PlayCircle className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Parcours
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{level}</h2>
            </div>
          </div>

          <div className="space-y-6">
            {[...modules.entries()].map(([moduleTitle, moduleLessons]) => (
              <div key={moduleTitle} className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {moduleTitle}
                </h3>
                <ul className="grid gap-4 lg:grid-cols-2">
                  {moduleLessons.map((lesson) => (
                    <li key={lesson.id}>
                      <article className="flex h-full flex-col justify-between rounded-[28px] border border-border bg-background/55 p-5 shadow-sm">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
                              {lesson.content_kind}
                            </span>
                            {lesson.audio_url || lesson.text_content ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                <Headphones className="size-3.5" />
                                Écoute
                              </span>
                            ) : null}
                          </div>
                          <h4 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                            {lesson.title}
                          </h4>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            {lessonSummary(lesson)}
                          </p>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                          <Button asChild className="rounded-full">
                            <Link href={`/academy/${lesson.id}`}>Lire</Link>
                          </Button>
                          <AccessibleAudioPlayer
                            audioUrl={lesson.audio_url}
                            ttsText={lesson.text_content}
                            buttonLabel="Écouter"
                            ttsLabel="Écouter"
                            compact
                          />
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
