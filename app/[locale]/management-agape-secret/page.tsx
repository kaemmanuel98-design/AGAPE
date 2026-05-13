import type { Metadata } from "next";

import { ManagementSecretMembersConsole } from "@/components/admin/ManagementSecretMembersConsole";
import { ManagementSecretSignOut } from "@/components/admin/ManagementSecretSignOut";
import { listAllMembersRegistrationForExport, listMembersRegistration } from "@/lib/members/queries";
import { getCurrentProfile } from "@/lib/profile/queries";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Console d'administration AGAPE",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ManagementAgapeSecretPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId, profile } = await getCurrentProfile();

  if (!userId || profile?.role !== "super-admin") {
    redirect({ href: "/", locale });
  }

  const rows = await listMembersRegistration();
  const rowsFull = await listAllMembersRegistrationForExport();

  return (
    <div className="pb-10 pt-4">
      <div className="mb-4 flex justify-end">
        <ManagementSecretSignOut locale={locale} />
      </div>
      <ManagementSecretMembersConsole rows={rows} rowsForExport={rowsFull} locale={locale} />
    </div>
  );
}
