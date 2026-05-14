import { getTranslations } from "next-intl/server";

import { PlanningBoard } from "@/components/planning/planning-board";
import { listPlanningForMembers } from "@/lib/planning/queries";

export const dynamic = "force-dynamic";

/**
 * Planning des cultes : lecture anonyme des créneaux (`planning`) via Supabase + RLS public `SELECT`.
 * Aucune connexion membre requise pour consulter cette page.
 */
export default async function PlanningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("planning");

  /* Données réelles : `planning` dans Supabase (services à venir pour les membres). */
  const entries = await listPlanningForMembers();

  return (
    <PlanningBoard
      entries={entries}
      locale={locale}
      slotOpenLabel={t("slotOpen")}
      emptyDescription={t("empty")}
      introSubtitle={t("intro")}
    />
  );
}
