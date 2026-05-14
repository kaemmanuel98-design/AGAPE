import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AcademyLessonDocument } from "@/components/academy/academy-lesson-document";
import { routing } from "@/i18n/routing";
import type { LessonRow } from "@/lib/academy/types";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Lecture directe d’une ligne `academy_courses` (même logique que `.eq('id').single()`).
 * Les logs en français aident à diagnostiquer RLS, UUID invalide ou clé anon absente.
 */
async function loadAcademyCourseById(id: string): Promise<LessonRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("academy_courses").select().eq("id", id).single();

  if (error) {
    console.error(
      "[AGAPE Academy] Échec requête Supabase sur `academy_courses` (select + eq id + single) :",
      error.message,
      "| id =",
      id,
    );
    return null;
  }

  if (!data) {
    console.log("[AGAPE Academy] Aucune ligne retournée pour l’identifiant :", id);
    return null;
  }

  return data as LessonRow;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = await loadAcademyCourseById(id);
  if (!lesson) return { title: "Academy" };
  return { title: `${lesson.title} · Academy AGAPE` };
}

/**
 * Page dynamique `/academy/[id]` : contenu issu de Supabase (`academy_courses`).
 * — Requête : `from('academy_courses').select().eq('id', id).single()`.
 * — Rendu : `AcademyLessonDocument` (livres = fiche de lecture standard, comme les autres cours).
 */
export default async function AcademyLessonByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  setRequestLocale(routing.defaultLocale);

  const lesson = await loadAcademyCourseById(id);

  if (!lesson) {
    notFound();
  }

  return <AcademyLessonDocument lesson={lesson} />;
}
