import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AcademyLessonDocument } from "@/components/academy/academy-lesson-document";
import { routing } from "@/i18n/routing";
import { getLessonById } from "@/lib/academy/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = await getLessonById(id);
  if (!lesson) return { title: "Academy" };
  return { title: `${lesson.title} · Academy AGAPE` };
}

/**
 * --- Étape 1 : route dynamique ---
 * Cette page répond à `/academy/[id]` (sans préfixe de locale dans l’URL).
 *
 * --- Étape 2 : lecture Supabase ---
 * On charge la ligne `academy_courses` dont la colonne `id` (UUID) correspond au segment `[id]`.
 * Si aucune ligne : `notFound()` → 404 Next.
 *
 * --- Étape 3 : locale next-intl ---
 * Hors segment `[locale]`, on fixe explicitement la locale par défaut pour que `getTranslations`
 * dans les composants enfants (`BookReader`, fiches livre, etc.) fonctionne comme sur `/fr/...`.
 *
 * --- Étape 4 : affichage du « content » ---
 * Le corps éditorial est en base dans `text_content` (équivalent du champ métier demandé « content ») ;
 * il est rendu en Markdown via `AcademyLessonDocument` → `MarkdownLessonBody`.
 *
 * --- Étape 5 : GYNOSKO ---
 * La mise en page premium (fond crème `#FDFBF7`, serif) est activée dans `AcademyLessonDocument`
 * lorsque `isGynoskoLesson(lesson)` est vrai (livre dont le titre contient « Gynosko »), via `BookReader`.
 */
export default async function AcademyLessonByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Étape 3 : contexte i18n pour toute l’arborescence rendue sur cette route.
  setRequestLocale(routing.defaultLocale);

  // Étape 2 : récupération du cours par identifiant d’URL.
  const lesson = await getLessonById(id);

  if (!lesson) {
    notFound();
  }

  // Étape 4 & 5 : rendu partagé avec `/[locale]/academy/[lessonId]` (Markdown + GYNOSKO).
  return <AcademyLessonDocument lesson={lesson} />;
}
