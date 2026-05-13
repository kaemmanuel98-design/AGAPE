"use client";

import { LogOut, Siren } from "lucide-react";
import { useMemo, useState } from "react";

import { MemberPhoneActions } from "@/components/admin/MemberPhoneActions";
import { MembersExportCsvButton } from "@/components/admin/MembersExportCsvButton";
import { MemberTalentBadges } from "@/components/admin/MemberTalentBadges";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MemberRegistrationNotesForm } from "@/components/admin/MemberRegistrationAdminForms";
import type { MemberRegistrationRow } from "@/lib/members/types";
import { cn } from "@/lib/utils";

type Props = {
  /** Lignes affichées (filtre local : toutes / urgentes). */
  rows: MemberRegistrationRow[];
  /**
   * Export « liste complète » : inclut les dossiers archivés si fourni par la page serveur.
   * Sinon, l'export se limite aux lignes visibles (`rows`).
   */
  rowsForExport?: MemberRegistrationRow[];
  /** Locale i18n pour revalidation côté serveur après sauvegarde des notes. */
  locale: string;
};

/**
 * Détermine si une ligne doit être traitée comme prioritaire dans l'UI (urgence ou équivalents legacy).
 */
function isCriticalRow(row: MemberRegistrationRow) {
  return (
    row.is_priority_emergency ||
    row.is_priority ||
    row.needs_urgent_help ||
    row.accompaniment_need === "urgence" ||
    row.category === "urgence" ||
    row.category === "urgence_vitale" ||
    row.category === "danger_immediat"
  );
}

/** Affichage court de la date d'inscription. */
function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

/**
 * Tableau de bord secondaire des inscriptions membres (vue cartes claires).
 * Les contrôles d'accès (super-admin) sont appliqués sur la route serveur — ici uniquement de la présentation.
 */
export function MembersRegistrationDashboard({ rows, rowsForExport, locale }: Props) {
  const [filter, setFilter] = useState<"all" | "critical">("all");
  const [signingOut, setSigningOut] = useState(false);

  const exportDataset = rowsForExport ?? rows;

  /** Tri : urgences en tête, puis date décroissante ; filtre optionnel « urgentes seulement ». */
  const sortedRows = useMemo(() => {
    const weight = (row: MemberRegistrationRow) => (isCriticalRow(row) ? 0 : 1);

    const base = [...rows].sort((a, b) => {
      const w = weight(a) - weight(b);
      if (w !== 0) return w;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (filter === "critical") {
      return base.filter((row) => isCriticalRow(row));
    }

    return base;
  }, [rows, filter]);

  /** Déconnexion session Supabase : retour sur la même URL sans page de login dédiée. */
  async function signOut() {
    setSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = window.location.pathname;
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      {/* En-tête AGAPE : titre produit + actions globales */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">AGAPE</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Inscriptions membres</h2>
          <p className="text-sm text-slate-600">
            {sortedRows.length} entrée(s) affichée(s) · les urgences restent en tête de liste.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MembersExportCsvButton rows={exportDataset} variant="light" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={signingOut}
            onClick={() => void signOut()}
            className="rounded-xl"
          >
            <LogOut className="size-4" aria-hidden />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Filtres locaux (ne modifient pas la base, uniquement la vue) */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="rounded-xl"
        >
          Toutes
        </Button>
        <Button
          type="button"
          variant={filter === "critical" ? "default" : "outline"}
          onClick={() => setFilter("critical")}
          className="rounded-xl"
        >
          Urgences
        </Button>
      </div>

      {sortedRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Aucune inscription pour le moment.
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedRows.map((row) => {
            const isCritical = isCriticalRow(row);

            return (
              <article
                key={row.id}
                className={cn(
                  "rounded-2xl border p-4",
                  /* Mise en évidence : bordure + fond léger pour les urgences (`is_priority_emergency`, etc.) */
                  isCritical
                    ? "border-red-300/90 bg-red-50/80 ring-1 ring-red-200/60"
                    : "border-slate-200 bg-slate-50/70",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {row.first_name || row.last_name
                        ? `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim()
                        : row.full_name || "Membre AGAPE"}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(row.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {row.accompaniment_need || row.category ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                        {row.accompaniment_need ?? row.category}
                      </span>
                    ) : null}
                    {isCritical ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                        <Siren className="size-3.5" aria-hidden />
                        Urgent
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Grille d'attributs : ville et talents mis en avant pour lecture rapide */}
                <dl className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Téléphone</dt>
                    <dd className="font-mono text-[13px]">{row.phone}</dd>
                    <dd className="mt-2">
                      <MemberPhoneActions phone={row.phone} variant="light" layout="row" />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Ville</dt>
                    <dd>{row.city?.trim() || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Langue</dt>
                    <dd>{row.preferred_language || "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Talents</dt>
                    <dd className="mt-1">
                      <MemberTalentBadges talents={row.talents} variant="light" />
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Résumé</dt>
                    <dd className="break-words">{row.situation || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Urgence (flag)</dt>
                    <dd>{row.is_priority_emergency ? "Oui" : "Non"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Aide urgente</dt>
                    <dd>{row.needs_urgent_help ? "Oui" : "Non"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Notes de suivi</dt>
                    <dd className="mt-1">
                      {/* useActionState + formAction : requis pour le build Vercel (React 19) */}
                      <MemberRegistrationNotesForm
                        key={`notes-${row.id}-${row.admin_notes ?? ""}`}
                        id={row.id}
                        locale={locale}
                        defaultNotes={row.admin_notes ?? ""}
                        theme="light"
                      />
                    </dd>
                  </div>
                </dl>

                {row.support_message ? (
                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/80 px-3 py-2 text-sm leading-relaxed text-slate-700">
                    {row.support_message}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
