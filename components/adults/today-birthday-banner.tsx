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
    <section className="agape-brand-surface rounded-[32px] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="agape-brand-badge">
            <PartyPopper className="size-3.5" />
            {t("birthdayBadge")}
          </div>
          <p className="text-lg font-semibold text-slate-50 md:text-xl">{title}</p>
          <p className="text-sm text-slate-300">{t("birthdayBannerHint")}</p>
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
                className="rounded-full border-white/12 bg-white/7 text-slate-100 hover:bg-white/12"
                variant="secondary"
              />
            );
          })}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#F4C95D]">
            <Gift className="size-5" />
          </div>
        </div>
      </div>
    </section>
  );
}
