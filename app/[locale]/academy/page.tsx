import { BookOpen, GraduationCap, Headphones, Layers3, PlayCircle, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { listLessons } from "@/lib/academy/queries";
import type { LessonRow } from "@/lib/academy/types";

export const dynamic = "force-dynamic";

type LessonGroup = {
  level: string;
  modules: {
    name: string;
    lessons: LessonRow[];
  }[];
};

function groupLessons(lessons: LessonRow[]): LessonGroup[] {
  const levels = new Map<string, Map<string, LessonRow[]>>();

  for (const lesson of lessons) {
    const level = lesson.level?.trim() || "Niveau général";
    const moduleName = lesson.module?.trim() || "Module principal";
    const moduleMap = levels.get(level) ?? new Map<string, LessonRow[]>();
    const rows = moduleMap.get(moduleName) ?? [];
    rows.push(lesson);
    moduleMap.set(moduleName, rows);
    levels.set(level, moduleMap);
  }

  return Array.from(levels, ([level, modules]) => ({
    level,
    modules: Array.from(modules, ([name, moduleLessons]) => ({
      name,
      lessons: moduleLessons,
    })),
  }));
}

function textPreview(text: string) {
  return text.length > 220 ? `${text.slice(0, 220).trim()}...` : text;
}

export default async function AcademyPage() {
  const lessons = await listLessons();
  const groups = groupLessons(lessons);

  return (
    <div className="space-y-8 pb-12">
      <section className="overflow-hidden rounded-[var(--radius)] border border-white/15 bg-card/65 p-6 shadow-xl backdrop-blur-md md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-sm font-medium text-blue-100">
              <GraduationCap className="size-4" aria-hidden />
              Académie biblique
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Modules par niveau
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Retrouvez les cours classés par niveau, avec lecture du support et écoute audio
              directement intégrée sur chaque leçon.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-[22px] border border-white/10 bg-white/5 p-3 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{groups.length}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Niveaux</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{lessons.length}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Leçons</p>
            </div>
          </div>
        </div>
      </section>

      {groups.length === 0 ? (
        <section className="rounded-[var(--radius)] border border-dashed border-white/20 bg-white/5 p-10 text-center">
          <Layers3 className="mx-auto size-10 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Aucune leçon publiée</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajoutez des cours depuis l’admin pour alimenter cette académie.
          </p>
        </section>
      ) : (
        groups.map((group) => (
          <section key={group.level} className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-[18px] bg-primary text-primary-foreground">
                <Layers3 className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Niveau
                </p>
                <h2 className="text-2xl font-bold text-foreground">{group.level}</h2>
              </div>
            </div>

            <div className="space-y-5">
              {group.modules.map((module) => (
                <div
                  key={`${group.level}-${module.name}`}
                  className="rounded-[var(--radius)] border border-border bg-card/55 p-5 shadow-lg backdrop-blur-md"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpen className="size-5 text-primary" aria-hidden />
                    <h3 className="text-lg font-semibold text-foreground">{module.name}</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {module.lessons.map((lesson) => (
                      <article
                        key={lesson.id}
                        id={`lesson-${lesson.id}`}
                        className="rounded-[22px] border border-white/10 bg-background/45 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{lesson.title}</h4>
                            {lesson.text_content ? (
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {textPreview(lesson.text_content)}
                              </p>
                            ) : null}
                          </div>
                          {lesson.video_url ? (
                            <a
                              href={lesson.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full bg-primary/15 p-2 text-primary"
                              aria-label={`Voir la vidéo: ${lesson.title}`}
                              title="Vidéo"
                            >
                              <PlayCircle className="size-5" aria-hidden />
                            </a>
                          ) : null}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {lesson.text_content ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-white/15 bg-white/5"
                              asChild
                            >
                              <a href={`#lesson-${lesson.id}`}>
                                <BookOpen className="size-4" aria-hidden />
                                Lire
                              </a>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-white/10 bg-white/5"
                              disabled
                            >
                              <BookOpen className="size-4" aria-hidden />
                              Lire
                            </Button>
                          )}
                          {lesson.audio_url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-white/15 bg-white/5"
                              asChild
                            >
                              <a href={`#audio-${lesson.id}`}>
                                <Volume2 className="size-4" aria-hidden />
                                Écouter
                              </a>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full border-white/10 bg-white/5"
                              disabled
                            >
                              <Volume2 className="size-4" aria-hidden />
                              Écouter
                            </Button>
                          )}
                        </div>

                        {lesson.text_content ? (
                          <details className="mt-4 rounded-[18px] border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                            <summary className="cursor-pointer font-medium text-foreground">
                              Ouvrir le texte complet
                            </summary>
                            <div className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                              {lesson.text_content}
                            </div>
                          </details>
                        ) : null}

                        {lesson.audio_url ? (
                          <div
                            id={`audio-${lesson.id}`}
                            className="mt-4 rounded-[18px] border border-primary/20 bg-primary/10 p-3"
                          >
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                              <Headphones className="size-4 text-primary" aria-hidden />
                              Lecteur audio intégré
                            </div>
                            <audio controls className="w-full" preload="none" src={lesson.audio_url}>
                              Votre navigateur ne peut pas lire cet audio.
                            </audio>
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Aucun audio disponible pour cette leçon.
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
