import { redirect as nextRedirect } from "next/navigation";

import { ProfilePage } from "@/components/profile/profile-page";
import { listCurrentChildProfiles, getCurrentProfile } from "@/lib/profile/queries";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId, profile } = await getCurrentProfile();

  if (!userId) {
    nextRedirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/profile`)}`);
  }

  const children = await listCurrentChildProfiles();

  return <ProfilePage initialProfile={profile} initialChildren={children} />;
}
