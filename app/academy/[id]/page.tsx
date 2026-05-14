import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";

/**
 * Route courte sans préfixe de locale : redirige vers la page dynamique réelle
 * `app/[locale]/academy/[lessonId]/page.tsx` (lecture Supabase par `lessonId` = UUID du cours).
 */
export default async function AcademyLessonByIdAliasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/${routing.defaultLocale}/academy/${id}`);
}
