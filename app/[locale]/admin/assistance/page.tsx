import type { Metadata } from "next";

import { AdminAssistance } from "@/components/admin/AdminAssistance";
import { getCurrentProfile } from "@/lib/profile/queries";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AGAPE Assistance",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminAssistancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { profile } = await getCurrentProfile();

  if (!profile || profile.role !== "super-admin") {
    redirect({ href: "/home", locale });
  }

  return <AdminAssistance locale={locale} />;
}
