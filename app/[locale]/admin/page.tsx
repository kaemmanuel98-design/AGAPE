import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { listAllPlanning, listDailyExhortations, listLessons } from "@/lib/academy/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [lessons, planning, exhortations] = await Promise.all([
    listLessons(),
    listAllPlanning(),
    listDailyExhortations(),
  ]);

  return (
    <AdminDashboard
      initialLessons={lessons}
      initialPlanning={planning}
      initialExhortations={exhortations}
    />
  );
}
