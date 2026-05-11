import { PlanningBoard } from "@/components/planning/planning-board";
import { listPlanning, listPlanningForCurrentMonth } from "@/lib/planning/queries";

export const dynamic = "force-dynamic";

export default async function PlanningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentMonth = await listPlanningForCurrentMonth();
  const entries = currentMonth.length > 0 ? currentMonth : await listPlanning();

  return <PlanningBoard entries={entries} locale={locale} />;
}
