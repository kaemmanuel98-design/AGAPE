import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AcademyLessonDocument } from "@/components/academy/academy-lesson-document";
import { routing } from "@/i18n/routing";
import type { LessonRow } from "@/lib/academy/types";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Ici on charge une ligne précise `academy_courses` pour afficher le détail d’un cours ou livre.
 */
async function loadAcademyCourseById(id: string): Promise<LessonRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("academy_courses").select().eq("id", id).single();

    if (error) {
      console.error(
        "[AGAPE Academy] Échec requête Supabase sur `academy_courses` (détail) :",
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
  } catch (e) {
    console.error("[AGAPE Academy] Exception lors du chargement du cours :", e);
    return null;
  }
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

/** Détail d’un cours — route `/academy/[id]`. */
export default async function AcademyLessonByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  setRequestLocale(routing.defaultLocale);

  const lesson = await loadAcademyCourseById(id);

  if (!lesson) {
    notFound();
  }

  return <AcademyLessonDocument lesson={lesson} />;
}
