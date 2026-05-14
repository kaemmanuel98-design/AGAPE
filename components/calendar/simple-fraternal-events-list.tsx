import { CalendarClock } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { FraternalCalendarComingSoon } from "@/components/calendar/fraternal-calendar-coming-soon";
import { listFraternalEventsTimeline } from "@/lib/calendar/event-queries";

/**
 * Liste simple des événements fraternels.
 * Lecture Supabase : table `fraternal_events` (via `listFraternalEventsTimeline` dans `lib/calendar/event-queries.ts`).
 */
export async function SimpleFraternalEventsList() {
  const t = await getTranslations("calendar");
  const locale = await getLocale();
  const { events, readFailed } = await listFraternalEventsTimeline();

  if (readFailed) {
    return <FraternalCalendarComingSoon />;
  }

  if (events.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 px-6 py-12 text-center">
        <p className="text-sm leading-relaxed text-slate-200 sm:text-base">{t("communityAppointmentsSoon")}</p>
      </div>
    );
  }

  const dateFmt = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  return (
    <ul className="space-y-3">
      {events.map((ev) => (
        <li
          key={ev.id}
          className="flex flex-col gap-2 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
        >
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#7CC6FF]">
              <CalendarClock className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#7CC6FF]">
                <time dateTime={ev.starts_at}>
                  {dateFmt.format(new Date(ev.starts_at))} · {timeFmt.format(new Date(ev.starts_at))}
                </time>
              </p>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-slate-50">{ev.title}</h3>
              {ev.description ? (
                <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-300">{ev.description}</p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
