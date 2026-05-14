import { SimplePlanningList } from "@/components/planning/simple-planning-list";

export const dynamic = "force-dynamic";

/**
 * Planning des cultes : liste simple alimentée par la table `planning` (Supabase).
 * Aucune connexion membre requise pour consulter cette page.
 */
export default async function PlanningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <SimplePlanningList locale={locale} />;
}
