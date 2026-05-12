import { Gift, PartyPopper } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { CongratulateMemberButton } from "@/components/calendar/congratulate-member-button";
import { formatBirthdayMemberName } from "@/lib/calendar/queries";
import type { PublicMemberBirthdayRow } from "@/lib/calendar/types";

function joinBirthdayNames(entries: PublicMemberBirthdayRow[]) {
  return entries.map((entry) => formatBirthdayMemberName(entry)).join(", ");
}

export async function TodayBirthdayBanner({
  birthdays,
}: {
  birthdays: PublicMemberBirthdayRow[];
}) {
  const t = await getTranslations("home.adults");

  if (!birthdays.length) {
    return null;
  }

  const names = joinBirthdayNames(birthdays);
  const title =
    birthdays.length === 1
      ? t("birthdayBannerSingle", { name: names })
      : t("birthdayBannerMultiple", { names });

  return (
    <section className="rounded-[32px] border border-amber-300/30 bg-gradient-to-r from-amber-500/15 via-orange-400/10 to-pink-500/10 p-6 shadow-lg backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            <PartyPopper className="size-3.5" />
            {t("birthdayBadge")}
          </div>
          <p className="text-lg font-semibold text-foreground md:text-xl">{title}</p>
          <p className="text-sm text-muted-foreground">{t("birthdayBannerHint")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {birthdays.map((person) => {
            const name = formatBirthdayMemberName(person);
            return (
              <CongratulateMemberButton
                key={person.id}
                recipientProfileId={person.id}
                recipientName={name}
                source="home"
                className="rounded-full"
                variant="secondary"
              />
            );
          })}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/15 text-amber-200">
            <Gift className="size-5" />
          </div>
        </div>
      </div>
    </section>
  );
}
