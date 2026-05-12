import { CalendarDays, Cake, Gift } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { CongratulateMemberButton } from "@/components/calendar/congratulate-member-button";
import { formatBirthdayMemberName, listCurrentMonthBirthdays } from "@/lib/calendar/queries";

function formatBirthdayDate(isoDate: string, locale: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day, 12));
}

export async function MonthCalendar() {
  const t = await getTranslations("calendar");
  const locale = await getLocale();
  const birthdays = await listCurrentMonthBirthdays();

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-card/55 p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <CalendarDays className="size-3.5" />
              {t("badge")}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {t("title")}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary/10 text-primary">
            <Gift className="size-8" />
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Cake className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {t("monthListTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("monthListSubtitle")}</p>
          </div>
        </div>

        {!birthdays.length ? (
          <div className="rounded-[24px] border border-dashed border-border bg-background/40 px-6 py-10 text-center text-sm text-muted-foreground">
            {t("emptyThisMonth")}
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {birthdays.map((person) => {
              const name = formatBirthdayMemberName(person);
              return (
                <li
                  key={person.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-border bg-background/40 p-5"
                >
                  <div className="flex items-center gap-4">
                    {person.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={person.avatar_url}
                        alt=""
                        className="h-14 w-14 rounded-[20px] object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/10 text-primary">
                        <Cake className="size-6" />
                      </div>
                    )}

                    <div>
                      <p className="text-lg font-semibold text-foreground">{name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatBirthdayDate(person.birth_date, locale)}
                      </p>
                    </div>
                  </div>

                  <CongratulateMemberButton
                    recipientProfileId={person.id}
                    recipientName={name}
                    source="calendar"
                    className="rounded-full"
                    variant="outline"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
