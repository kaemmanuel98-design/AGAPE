import type { Metadata } from "next";

import { MembersRegistrationDashboard } from "@/components/admin/MembersRegistrationDashboard";
import { listMembersRegistration } from "@/lib/members/queries";
import { getCurrentProfile } from "@/lib/profile/queries";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AGAPE",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSecretDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId, profile } = await getCurrentProfile();

  if (!userId) {
    redirect({ href: "/", locale });
  }

  if (profile?.role !== "super-admin") {
    redirect({ href: "/", locale });
  }

  const rows = await listMembersRegistration();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <MembersRegistrationDashboard rows={rows} />
    </div>
  );
}
