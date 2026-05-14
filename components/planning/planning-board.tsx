import { BookOpen, CalendarDays, Mic2, Radio, ShieldCheck, Users } from "lucide-react";

import type { PlanningRow } from "@/lib/planning/types";

const RESPONSIBILITY_META = [
  { key: "regie", label: "Régie", icon: Radio },
  { key: "protocole", label: "Protocole", icon: ShieldCheck },
  { key: "accueil", label: "Accueil", icon: Users },
  { key: "louange", label: "Louange", icon: Mic2 },
  { key: "predication", label: "Prédication", icon: BookOpen },
] as const;

type Props = {
  entries: PlanningRow[];
  locale: string;
  /** Libellé pour un poste encore vacant (créneau disponible pour les membres). */
  slotOpenLabel?: string;
  /** Texte lorsque la table `planning` est vide ou inaccessible. */
  emptyDescription?: string;
  /** Sous-titre sous le titre principal. */
  introSubtitle?: string;
};

/**
 * Affichage des créneaux de service : chaque ligne `planning` = un culte ; chaque colonne = un rôle.
 * Les cellules vides montrent `slotOpenLabel` (poste encore ouvert).
 */
export function PlanningBoard({
  entries,
  locale,
  slotOpenLabel = "Créneau libre — contacte l'équipe pour t'inscrire.",
  emptyDescription = "Le programme apparaîtra ici dès que les cultes seront remplis dans l'admin.",
  introSubtitle = "Les services à venir et les postes pourvus ou encore disponibles.",
}: Props) {
  if (!entries.length) {
    return (
      <section className="agape-brand-surface rounded-[var(--radius)] p-8">
        <div className="flex items-center gap-3 text-slate-50">
          <CalendarDays className="size-7 text-[#7CC6FF]" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Planning</h2>
            <p className="mt-1 text-sm text-slate-300">{emptyDescription}</p>
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
          <h1 className="text-3xl font-semibold tracking-tight">Planning</h1>
          <p className="mt-1 text-sm text-slate-300">{introSubtitle}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {entries.map((entry) => {
          const assignedCount = RESPONSIBILITY_META.filter(({ key }) => {
            const value = entry[key as keyof PlanningRow];
            return typeof value === "string" && value.trim().length > 0;
          }).length;

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
                  {assignedCount}/{RESPONSIBILITY_META.length} rôles pourvus
                </span>
              </div>

              {/* Une carte par rôle : nom renseigné ou libellé « créneau libre ». */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {RESPONSIBILITY_META.map(({ key, label, icon: Icon }) => {
                  const raw = entry[key as keyof PlanningRow];
                  const filled = typeof raw === "string" && raw.trim().length > 0;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-[20px] border border-white/8 bg-slate-950/20 px-4 py-3"
                    >
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-[#7CC6FF]">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                        <p className={filled ? "font-medium text-slate-100" : "text-sm italic text-slate-500"}>
                          {filled ? String(raw) : slotOpenLabel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
