import { CalendarDays, Cake, Gift } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { CalendarEventsTimeline } from "@/components/calendar/calendar-events-timeline";
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
      {/* En-tête calendrier fraternel AGAPE */}
      <section className="agape-brand-surface rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="agape-brand-badge">
              <CalendarDays className="size-3.5" />
              {t("badge")}
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl md:text-4xl">{t("title")}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">{t("subtitle")}</p>
            </div>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[24px] bg-white/10 text-[#F4C95D] sm:h-16 sm:w-16">
            <Gift className="size-7 sm:size-8" />
          </div>
        </div>
      </section>

      {/* Section événements : timeline chronologique (meilleure ergonomie mobile qu’un calendrier grille) */}
      <section className="agape-brand-surface rounded-[32px] p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#7CC6FF]">
            <CalendarDays className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-50">{t("eventsTitle")}</h2>
            <p className="text-sm text-slate-300">{t("eventsSubtitle")}</p>
          </div>
        </div>
        <CalendarEventsTimeline />
      </section>

      {/* Section anniversaires : cartes en grille ; ici on boucle sur les membres du mois courant */}
      <section className="agape-brand-surface rounded-[32px] p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#7CC6FF]">
            <Cake className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-50">{t("monthListTitle")}</h2>
            <p className="text-sm text-slate-300">{t("monthListSubtitle")}</p>
          </div>
        </div>

        {!birthdays.length ? (
          <div className="rounded-[24px] border border-dashed border-white/12 bg-white/5 px-6 py-10 text-center text-sm text-slate-300">
            {t("emptyThisMonth")}
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {birthdays.map((person) => {
              const name = formatBirthdayMemberName(person);
              return (
                <li
                  key={person.id}
                  className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/5 p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {person.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={person.avatar_url}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-[20px] object-cover shadow-[0_12px_24px_rgba(15,23,42,0.2)]"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white/10 text-[#F4C95D]">
                        <Cake className="size-6" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-slate-50">{name}</p>
                      <p className="text-sm text-slate-300">{formatBirthdayDate(person.birth_date, locale)}</p>
                    </div>
                  </div>

                  <CongratulateMemberButton
                    recipientProfileId={person.id}
                    recipientName={name}
                    source="calendar"
                    className="w-full shrink-0 rounded-full border-white/12 bg-white/7 text-slate-100 hover:bg-white/12 sm:w-auto"
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
