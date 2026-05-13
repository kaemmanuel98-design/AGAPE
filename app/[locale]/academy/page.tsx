import { BookOpenText, GraduationCap, Headphones, Layers3, PlayCircle } from "lucide-react";

import { AccessibleAudioPlayer } from "@/components/audio/accessible-audio-player";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { listAllLessons } from "@/lib/academy/queries";
import type { LessonRow } from "@/lib/academy/types";

export const dynamic = "force-dynamic";

/**
 * Groupe les leçons par niveau puis par module
 */
function groupLessons(lessons: LessonRow[]) {
  const grouped = new Map<string, Map<string, LessonRow[]>>();

  for (const lesson of lessons) {
    const level = lesson.level || "Niveau général";
    const moduleTitle = lesson.module_title || "Module principal";
    
    const levelGroup = grouped.get(level) ?? new Map<string, LessonRow[]>();
    const moduleGroup = levelGroup.get(moduleTitle) ?? [];
    
    moduleGroup.push(lesson);
    levelGroup.set(moduleTitle, moduleGroup);
    grouped.set(level, levelGroup);
  }

  return grouped;
}

function lessonSummary(text: string | null) {
  if (!text) return "Leçon pensée pour une écoute simple ou un visionnage guidé.";
  return text.length > 180 ? `${text.slice(0, 180).trim()}...` : text;
}

export default async function AcademyPage() {
  const lessons = await listAllLessons();
  const grouped = groupLessons(lessons);

  return (
    <div className="space-y-8 pb-12">
      {/* Header avec statistiques */}
      <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/65 p-6 shadow-xl backdrop-blur-md md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
              <GraduationCap className="size-4" aria-hidden />
              Académie biblique
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Modules par niveau
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Retrouvez les cours classés par parcours. Chaque leçon peut être lue en détail 
              ou écoutée via le lecteur intégré (audio réel ou synthèse vocale).
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 rounded-[22px] border border-white/10 bg-white/5 p-3 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{grouped.size}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Niveaux</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{lessons.length}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Leçons</p>
            </div>
          </div>
        </div>
      </section>

      {lessons.length === 0 ? (
        <section className="rounded-[var(--radius)] border border-dashed border-border bg-card/50 p-10 text-center">
          <Layers3 className="mx-auto size-10 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Aucune leçon publiée</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajoutez votre premier cours depuis l'administration.
          </p>
        </section>
      ) : (
        [...grouped.entries()].map(([level, modules]) => (
          <section key={level} className="space-y-5">
            {/* Titre du Niveau */}
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-[18px] bg-primary text-primary-foreground">
                <Layers3 className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Parcours
                </p>
                <h2 className="text-2xl font-bold text-foreground">{level}</h2>
              </div>
            </div>

            <div className="space-y-6">
              {[...modules.entries()].map(([moduleTitle, moduleLessons]) => (
                <div 
                  key={`${level}-${moduleTitle}`}
                  className="rounded-[var(--radius)] border border-border bg-card/45 p-6 shadow-lg backdrop-blur-md"
                >
                  <div className="mb-5 flex items-center gap-2">
                    <BookOpenText className="size-5 text-primary" aria-hidden />
                    <h3 className="text-lg font-semibold text-foreground">{moduleTitle}</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {moduleLessons.map((lesson) => (
                      <article
                        key={lesson.id}
                        className="flex flex-col justify-between rounded-[22px] border border-white/10 bg-background/45 p-5 transition-colors hover:bg-background/60"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                              {lesson.content_kind}
                            </span>
                            {lesson.video_url && (
                              <PlayCircle className="size-4 text-primary/60" />
                            )}
                          </div>
                          
                          <h4 className="mt-3 text-lg font-semibold text-foreground">{lesson.title}</h4>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {lessonSummary(lesson.text_content)}
                          </p>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                          <Button asChild size="sm" className="rounded-full px-5">
                            <Link href={`/academy/${lesson.id}`}>Lire la leçon</Link>
                          </Button>
                          
                          <AccessibleAudioPlayer
                            audioUrl={lesson.audio_url}
                            ttsText={lesson.text_content}
                            buttonLabel="Écouter"
                            ttsLabel="Synthèse vocale"
                            compact
                          />
                        </div>
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
