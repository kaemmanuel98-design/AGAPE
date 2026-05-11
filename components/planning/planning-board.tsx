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
      <section className="rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3 text-foreground">
          <CalendarDays className="size-7 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Planning du mois</h2>
            <p className="mt-1 text-sm text-muted-foreground">
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
    <section className="space-y-5 rounded-[var(--radius)] border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3 text-foreground">
        <CalendarDays className="size-7 text-primary" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Planning du mois</h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
              className="rounded-[28px] border border-border bg-background/55 p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {entry.service_name}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                    {dateFormatter.format(new Date(entry.service_date))}
                  </h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {people.length} rôle{people.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {people.map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-[20px] border border-border bg-card/70 px-4 py-3"
                  >
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="font-medium text-foreground">
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
