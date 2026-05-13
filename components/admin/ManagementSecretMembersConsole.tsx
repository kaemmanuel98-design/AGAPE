import { ShieldAlert } from "lucide-react";

import {
  MemberRegistrationArchiveForm,
  MemberRegistrationNotesForm,
} from "@/components/admin/MemberRegistrationAdminForms";
import { Link } from "@/i18n/navigation";
import { MemberPhoneActions } from "@/components/admin/MemberPhoneActions";
import { MembersExportCsvButton } from "@/components/admin/MembersExportCsvButton";
import { MemberTalentBadges } from "@/components/admin/MemberTalentBadges";
import type { MemberRegistrationRow } from "@/lib/members/types";
import { cn } from "@/lib/utils";

/**
 * Affichage du nom principal (prénom + nom, sinon nom complet AGAPE).
 */
function displayName(row: MemberRegistrationRow) {
  const joined = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return joined || row.full_name || "—";
}

/** Libellé lisible pour le besoin d'accompagnement stocké en base. */
function formatNeed(value: string | null) {
  if (!value) return "—";
  const map: Record<string, string> = {
    soutien_moral: "Soutien moral",
    deuil: "Deuil",
    maladie: "Maladie",
    urgence: "Urgence",
  };
  return map[value] ?? value;
}

/** Langue préférée compacte (FR / EN / NL). */
function formatLang(value: string | null) {
  if (!value) return "—";
  const map: Record<string, string> = { fr: "FR", en: "EN", nl: "NL", autre: "Autre" };
  return map[value] ?? value;
}

/** Date d'inscription formatée localement pour le tableau. */
function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type Props = {
  /** Lignes visibles dans le tableau (dossiers non archivés, tri serveur). */
  rows: MemberRegistrationRow[];
  /** Jeu étendu pour l'export CSV « liste complète » (inclut les archivés). */
  rowsForExport: MemberRegistrationRow[];
  locale: string;
};

/**
 * Console d'administration AGAPE — inscriptions membres (`members_registration`).
 * Rôle attendu côté route : super-admin uniquement (contrôle serveur + middleware).
 * Aucune page de connexion ici : les non autorisés sont redirigés vers l'accueil (portail ouvert).
 */
export function ManagementSecretMembersConsole({ rows, rowsForExport, locale }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-5 shadow-2xl ring-1 ring-white/5 sm:p-8">
      {/* En-tête : identité produit AGAPE + titre légal de la page pour l'administrateur */}
      <header className="mb-8 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">AGAPE</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            Console d&apos;administration AGAPE
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            Inscriptions membres — accès restreint. Les dossiers archivés disparaissent de cette vue ; l&apos;export peut
            inclure l&apos;historique complet.
          </p>
        </div>

        {/* Zone utilitaire : retour public, compteur, export (composant client isolé) */}
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Link
            href="/"
            className="text-xs font-medium text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
          >
            Retour à l&apos;accueil
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <MembersExportCsvButton rows={rowsForExport} variant="dark" />
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-400">
              <ShieldAlert className="size-4 text-zinc-300" aria-hidden />
              <span>{rows.length} dossier(s) actif(s)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Corps : tableau responsive (défilement horizontal sur petits écrans) */}
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-14 text-center text-sm text-zinc-500">
          Aucune inscription à afficher.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Talents</th>
                <th className="px-4 py-3">Besoin</th>
                <th className="px-4 py-3">Message</th>
                <th className="min-w-[220px] px-4 py-3">Notes de suivi</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rows.map((row) => {
                const urgent = row.is_priority_emergency;

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "align-top transition-colors",
                      /* Mise en évidence des urgences : fond rouge léger + bordure gauche */
                      urgent
                        ? "border-l-4 border-red-500 bg-red-950/35 hover:bg-red-950/45"
                        : "border-l-4 border-transparent bg-zinc-950/40 hover:bg-zinc-900/50",
                    )}
                  >
                    {/* Identité + métadonnées temporelles / langue */}
                    <td className="px-4 py-4 text-zinc-100">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{displayName(row)}</span>
                          {urgent ? (
                            <span className="inline-flex items-center rounded-md border border-red-400/50 bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-100">
                              Urgent
                            </span>
                          ) : null}
                        </div>
                        <span className="text-xs text-zinc-500">{formatDate(row.created_at)}</span>
                        <span className="text-xs text-zinc-500">Langue : {formatLang(row.preferred_language)}</span>
                      </div>
                    </td>

                    {/* Colonne ville explicite (champ `city`) */}
                    <td className="px-4 py-4 text-zinc-300">{row.city?.trim() || "—"}</td>

                    {/* Numéro affiché + actions copier / appeler (composant client) */}
                    <td className="px-4 py-4 text-zinc-300">
                      <span className="font-mono text-[13px]">{row.phone}</span>
                      <div className="mt-2">
                        <MemberPhoneActions phone={row.phone} variant="dark" layout="row" />
                      </div>
                    </td>

                    {/* Talents JSONB → badges colorés */}
                    <td className="px-4 py-4">
                      <MemberTalentBadges talents={row.talents} variant="dark" />
                    </td>

                    <td className="px-4 py-4 text-zinc-300">{formatNeed(row.accompaniment_need)}</td>

                    <td className="max-w-[220px] px-4 py-4 text-xs leading-relaxed text-zinc-400">
                      <span className="line-clamp-4 whitespace-pre-wrap">{row.support_message || "—"}</span>
                    </td>

                    {/* Notes de suivi : composant client + useActionState (exigence build Vercel / React 19) */}
                    <td className="px-4 py-4">
                      <MemberRegistrationNotesForm
                        key={`notes-${row.id}-${row.admin_notes ?? ""}`}
                        id={row.id}
                        locale={locale}
                        defaultNotes={row.admin_notes ?? ""}
                        theme="dark"
                      />
                    </td>

                    {/* Archivage : même pattern useActionState / formAction */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-end gap-2">
                        <MemberRegistrationArchiveForm id={row.id} locale={locale} theme="dark" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
