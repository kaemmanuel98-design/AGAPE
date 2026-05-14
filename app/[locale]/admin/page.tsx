import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { listAllLessons } from "@/lib/academy/queries";
import { listAllContents } from "@/lib/contents/queries";
import { listRecentExhortations } from "@/lib/exhortations/queries";
import { listPlanning } from "@/lib/planning/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const contents = await listAllContents();
  const { lessons } = await listAllLessons();
  const planning = await listPlanning();
  const exhortations = await listRecentExhortations();

  return (
    <AdminDashboard
      initialContents={contents}
      initialLessons={lessons}
      initialPlanning={planning}
      initialExhortations={exhortations}
    />
  );
}
