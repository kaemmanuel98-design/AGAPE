import { format } from "date-fns";
import { enUS, fr, nl } from "date-fns/locale";
import { CalendarCheck, CalendarDays, Mic2, MonitorSpeaker, ShieldCheck, Users } from "lucide-react";

import { listPlanningForMonth } from "@/lib/academy/queries";
import type { PlanningRow } from "@/lib/academy/types";

export const dynamic = "force-dynamic";

const localeMap = { fr, en: enUS, nl };

const roles: {
  key: keyof Pick<
    PlanningRow,
    "regie" | "protocole" | "louange" | "predication" | "intercession" | "accueil"
  >;
  label: string;
  Icon: typeof Users;
}[] = [
  { key: "regie", label: "Régie", Icon: MonitorSpeaker },
  { key: "protocole", label: "Protocole", Icon: ShieldCheck },
  { key: "louange", label: "Louange", Icon: Mic2 },
  { key: "predication", label: "Prédication", Icon: Users },
  { key: "intercession", label: "Intercession", Icon: Users },
  { key: "accueil", label: "Accueil", Icon: Users },
];

export default async function PlanningPage({
  params,
}: {
  params: Promise<{ locale: keyof typeof localeMap }>;
}) {
  const { locale } = await params;
  const dfLocale = localeMap[locale] ?? fr;
  const planning = await listPlanningForMonth();
  const now = new Date();

  return (
    <div className="space-y-8 pb-12">
      <section className="rounded-[var(--radius)] border border-white/15 bg-card/65 p-6 shadow-xl backdrop-blur-md md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-sm font-medium text-blue-100">
              <CalendarCheck className="size-4" aria-hidden />
              Planning du mois
            </div>
            <h1 className="text-3xl font-bold capitalize tracking-tight text-foreground md:text-4xl">
              {format(now, "MMMM yyyy", { locale: dfLocale })}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Consultez les cultes et les personnes responsables pour la régie, le protocole,
              l’accueil et les autres services.
            </p>
          </div>
          <div className="flex size-16 items-center justify-center rounded-[24px] bg-primary text-primary-foreground shadow-lg">
            <CalendarDays className="size-8" aria-hidden />
          </div>
        </div>
      </section>

      {planning.length === 0 ? (
        <section className="rounded-[var(--radius)] border border-dashed border-white/20 bg-white/5 p-10 text-center">
          <CalendarDays className="mx-auto size-10 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Aucun programme publié</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Le planning de ce mois apparaîtra ici dès qu’il sera rempli dans l’admin.
          </p>
        </section>
      ) : (
        <div className="grid gap-4">
          {planning.map((entry) => {
            const serviceDate = new Date(`${entry.service_date}T12:00:00`);

            return (
              <article
                key={entry.id}
                className="overflow-hidden rounded-[var(--radius)] border border-border bg-card/55 shadow-lg backdrop-blur-md"
              >
                <div className="flex flex-col gap-4 border-b border-border bg-white/5 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-[22px] bg-primary text-primary-foreground">
                      <span className="text-xs font-semibold uppercase">
                        {format(serviceDate, "MMM", { locale: dfLocale })}
                      </span>
                      <span className="text-2xl font-bold">{format(serviceDate, "d")}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize text-muted-foreground">
                        {format(serviceDate, "EEEE", { locale: dfLocale })}
                      </p>
                      <h2 className="text-xl font-bold text-foreground">
                        {entry.service_name || "Culte"}
                      </h2>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-background/35 px-4 py-2 text-sm text-muted-foreground">
                    <CalendarCheck className="size-4 text-primary" aria-hidden />
                    Programme
                  </div>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {roles.map(({ key, label, Icon }) => (
                    <div key={key} className="rounded-[18px] border border-white/10 bg-background/40 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Icon className="size-4 text-primary" aria-hidden />
                        {label}
                      </div>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {entry[key] || "À compléter"}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
