import { CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { listPlanningForMembers } from "@/lib/planning/queries";

type Props = {
  locale: string;
};

/**
 * Liste simple des créneaux de culte / services.
 * Lecture Supabase : table `planning` (via `listPlanningForMembers` dans `lib/planning/queries.ts`).
 */
export async function SimplePlanningList({ locale }: Props) {
  const t = await getTranslations("planning");
  const entries = await listPlanningForMembers();

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (entries.length === 0) {
    return (
      <section className="agape-brand-surface rounded-[var(--radius)] p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#7CC6FF]">
            <CalendarDays className="size-7" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">Planning</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">{t("communityAppointmentsSoon")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="agape-brand-surface space-y-6 rounded-[var(--radius)] p-8">
      <div className="flex items-center gap-3 text-slate-50">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#7CC6FF]">
          <CalendarDays className="size-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Planning</h1>
          <p className="mt-1 text-sm text-slate-300">{t("intro")}</p>
        </div>
      </div>

      <ul className="space-y-3">
        {entries.map((row) => (
          <li
            key={row.id}
            className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 sm:px-5 sm:py-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7CC6FF]">{row.service_name}</p>
            <p className="mt-1 text-lg font-semibold text-slate-50">{dateFormatter.format(new Date(row.service_date))}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
