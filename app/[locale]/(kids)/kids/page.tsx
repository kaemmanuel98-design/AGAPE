import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import { ContentCards } from "@/components/discover/content-cards";
import { KidsHomePanel } from "@/components/kids/kids-home-panel";
import { KidsPrayerCard } from "@/components/kids/kids-prayer-card";
import { getContentsByCategory } from "@/lib/contents/queries";
import { KIDS_PROFILE_COOKIE, parseKidProfileJson } from "@/lib/kids/profile-cookie";

export const dynamic = "force-dynamic";

export default async function KidsHomePage() {
  const contents = await getContentsByCategory("child");
  const cookieStore = await cookies();
  const kidProfile = parseKidProfileJson(cookieStore.get(KIDS_PROFILE_COOKIE)?.value);
  const t = await getTranslations("discover");

  return (
    <div className="space-y-8">
      <KidsHomePanel kidProfile={kidProfile} />
      <ContentCards
        contents={contents}
        theme="kids"
        headingId="kids-discover-heading"
        title={t("kidsHeading")}
        subtitle={t("kidsSubheading")}
      />
      <KidsPrayerCard defaultName={kidProfile?.firstName ?? null} />
    </div>
  );
}
