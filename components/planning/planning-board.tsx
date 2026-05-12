import { CalendarDays, Mic2, Radio, ShieldCheck, Users } from "lucide-react";

import type { PlanningRow } from "@/lib/planning/types";

const RESPONSIBILITY_META = [
  { key: "regie", label: "Régie", icon: Radio },
  { key: "protocole", label: "Protocole", icon: ShieldCheck },
  { key: "accueil", label: "Accueil", icon: Users },
  { key: "louange", label: "Louange", icon: Mic2 },
  { key: "predication", label: "Prédication", icon: CalendarDays },
] as const;

export function PlanningBoard({
  entries,
  locale,
}: {
  entries: PlanningRow[];
  locale: string;
}) {
  if (!entries.length) {
    return (
      <section className="agape-brand-surface rounded-[var(--radius)] p-8">
        <div className="flex items-center gap-3 text-slate-50">
          <CalendarDays className="size-7 text-[#7CC6FF]" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Planning du mois</h2>
            <p className="mt-1 text-sm text-slate-300">
              Le programme apparaîtra ici dès que les cultes seront remplis dans l&apos;admin.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="agape-brand-surface space-y-5 rounded-[var(--radius)] p-8">
      <div className="flex items-center gap-3 text-slate-50">
        <CalendarDays className="size-7 text-[#7CC6FF]" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Planning du mois</h1>
          <p className="mt-1 text-sm text-slate-300">
            Une vue claire des cultes et des personnes responsables.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {entries.map((entry) => {
          const people = RESPONSIBILITY_META.filter(({ key }) => {
            const value = entry[key as keyof PlanningRow];
            return typeof value === "string" && value.trim().length > 0;
          });

          return (
            <article
              key={entry.id}
              className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7CC6FF]">
                    {entry.service_name}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-50">
                    {dateFormatter.format(new Date(entry.service_date))}
                  </h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-[#F4C95D]">
                  {people.length} rôle{people.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {people.map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-[20px] border border-white/8 bg-slate-950/20 px-4 py-3"
                  >
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-[#7CC6FF]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                      <p className="font-medium text-slate-100">
                        {String(entry[key as keyof PlanningRow] ?? "")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
