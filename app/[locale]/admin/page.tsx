import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { listAllContents } from "@/lib/contents/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const contents = await listAllContents();

  return <AdminDashboard initialContents={contents} />;
}
