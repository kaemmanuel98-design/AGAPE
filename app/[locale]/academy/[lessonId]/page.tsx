import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AcademyLessonDocument } from "@/components/academy/academy-lesson-document";
import { getLessonById } from "@/lib/academy/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await getLessonById(lessonId);
  if (!lesson) return { title: "Academy" };
  return { title: `${lesson.title} · Academy AGAPE` };
}

/**
 * Page dynamique d’une leçon Academy (`/[locale]/academy/[lessonId]`).
 *
 * --- Données Supabase ---
 * `getLessonById(lessonId)` exécute un `SELECT` sur `public.academy_courses` avec `WHERE id = :lessonId`
 * (client `@/utils/supabase/server`, voir `lib/academy/queries.ts`). Tout le contenu affiché
 * (`text_content`, `video_url`, `audio_url`, métadonnées livre, etc.) provient de cette ligne.
 *
 * --- Mise en page « Manuscrit » (GYNOSKO) ---
 * Si `content_kind === "livre"` et que le titre correspond au livre GYNOSKO (`isGynoskoLesson`),
 * on délègue à `BookReader` : fond crème `#FDFBF7`, Playfair + Merriweather, colonne type livre ouvert.
 * Les autres livres utilisent `AcademyBookReadingSheet`.
 */
export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = await getLessonById(lessonId);

  if (!lesson) {
    notFound();
  }

  return <AcademyLessonDocument lesson={lesson} />;
}
