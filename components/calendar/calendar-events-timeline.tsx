import { CalendarClock, ExternalLink, UserPlus } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { listFraternalEventsTimeline } from "@/lib/calendar/event-queries";
import { cn } from "@/lib/utils";

function formatEventDate(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatEventTime(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/**
 * Vue chronologique type « timeline » : lisible sur mobile sans grille de calendrier complexe.
 * Ici on boucle sur les événements fraternels triés par date de début (requête serveur).
 */
export async function CalendarEventsTimeline() {
  const t = await getTranslations("calendar");
  const locale = await getLocale();
  const events = await listFraternalEventsTimeline();

  if (events.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 px-5 py-10 text-center text-sm text-slate-300">
        {t("timelineEmpty")}
      </div>
    );
  }

  return (
    <ol className="relative space-y-0 border-l border-white/15 pl-6 sm:pl-8">
      {events.map((ev, index) => (
        <li key={ev.id} className="relative pb-10 last:pb-0">
          {/* Pastille sur la ligne verticale de la timeline */}
          <span
            className={cn(
              "absolute -left-[25px] top-1 flex size-3 rounded-full border-2 border-slate-900 sm:-left-[29px] sm:size-3.5",
              index === 0 ? "bg-[#7CC6FF] shadow-[0_0_12px_rgba(124,198,255,0.6)]" : "bg-white/40",
            )}
            aria-hidden
          />
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#7CC6FF]">
                  <CalendarClock className="size-3.5 shrink-0" aria-hidden />
                  <time dateTime={ev.starts_at}>
                    {formatEventDate(ev.starts_at, locale)} · {formatEventTime(ev.starts_at, locale)}
                  </time>
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-50">{ev.title}</h3>
                {ev.description ? (
                  <p className="max-w-prose text-sm leading-relaxed text-slate-300">{ev.description}</p>
                ) : null}
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:min-w-[10rem]">
                {ev.registration_url ? (
                  <Button asChild size="sm" variant="secondary" className="w-full rounded-xl sm:w-auto">
                    <a href={ev.registration_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2">
                      <UserPlus className="size-4 shrink-0" aria-hidden />
                      {t("registerEvent")}
                    </a>
                  </Button>
                ) : null}
                {ev.meeting_url ? (
                  <Button asChild size="sm" variant="outline" className="w-full rounded-xl border-white/20 bg-white/5 text-slate-100 hover:bg-white/10 sm:w-auto">
                    <a href={ev.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2">
                      <ExternalLink className="size-4 shrink-0" aria-hidden />
                      {t("meetingLink")}
                    </a>
                  </Button>
                ) : null}
                {!ev.registration_url && !ev.meeting_url ? (
                  <span className="text-xs text-slate-500">{t("eventDetailsSoon")}</span>
                ) : null}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
