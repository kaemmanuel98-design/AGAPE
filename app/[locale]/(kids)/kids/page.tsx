import { cookies } from "next/headers";

import { ContentCards } from "@/components/discover/content-cards";
import { KidsHomePanel } from "@/components/kids/kids-home-panel";
import { getContentsByCategory } from "@/lib/contents/queries";
import { KIDS_PROFILE_COOKIE, parseKidProfileJson } from "@/lib/kids/profile-cookie";

export const dynamic = "force-dynamic";

export default async function KidsHomePage() {
  const contents = await getContentsByCategory("child");
  const cookieStore = await cookies();
  const kidProfile = parseKidProfileJson(cookieStore.get(KIDS_PROFILE_COOKIE)?.value);

  return (
    <div className="space-y-8">
      <KidsHomePanel kidProfile={kidProfile} />
      <ContentCards contents={contents} theme="kids" headingId="kids-discover-heading" />
    </div>
  );
}
