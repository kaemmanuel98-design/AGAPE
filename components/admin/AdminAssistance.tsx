import { AlertTriangle, HeartHandshake, ShieldAlert } from "lucide-react";

import { AdminAssistanceExportCsvButton } from "@/components/admin/AdminAssistanceExportCsvButton";
import { AdminAssistanceRequestForm } from "@/components/admin/AdminAssistanceRequestForm";
import { AdminContactReachActions } from "@/components/admin/AdminContactReachActions";
import { listAdminAssistanceRequests } from "@/lib/prayer/queries";

/**
 * Tableau « AGAPE Assistance » (demandes `prayer_requests`).
 * Aucun `<form>` direct ici : les formulaires d’édition passent par `AdminAssistanceRequestForm`,
 * qui applique `useActionState` + `formAction` vers `updateAssistanceRequest` (exigence React 19 / déploiement Vercel).
 */

/**
 * Formate une date ISO pour affichage humain dans l'interface d'encadrement.
 */
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
 * Reconstitue le nom affiché : profil lié (prénoms + nom) sinon expéditeur libre, sinon libellé AGAPE par défaut.
 */
function formatMemberName(request: Awaited<ReturnType<typeof listAdminAssistanceRequests>>[number]) {
  const joined = [
    request.requester_profile?.first_names,
    request.requester_profile?.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return joined || request.sender_name || "Membre AGAPE";
}

/** Catégorie de besoin (prière / accompagnement / urgence vitale, etc.). */
function formatCategory(value: string | null) {
  switch (value) {
    case "urgence_vitale":
      return "Urgence vitale";
    case "maladie":
      return "Maladie";
    case "deuil":
      return "Deuil";
    case "accompagnement":
      return "Accompagnement";
    default:
      return "Prière";
  }
}

/** Statut opérationnel du dossier côté équipe AGAPE. */
function formatStatus(value: string) {
  switch (value) {
    case "en_cours":
      return "En cours";
    case "accompagne":
      return "Accompagne";
    default:
      return "En attente";
  }
}

/**
 * Composant serveur : tableau de bord « AGAPE Assistance ».
 *
 * IMPORTANT — périmètre fonctionnel :
 * - Ces données proviennent de `prayer_requests` (demandes d'accompagnement / prières), PAS de `members_registration`.
 * - L'export CSV associé exporte donc ces demandes, pas la liste des membres inscrits (voir console secrète membres).
 *
 * Sécurité :
 * - La route `/admin/assistance` doit rester protégée côté application (rôle super-admin ou garde équivalente).
 * - Aucune redirection vers une page de connexion : le portail AGAPE reste ouvert ; seules les routes admin refusent l'accès.
 */
export async function AdminAssistance({ locale }: { locale: string }) {
  const requests = await listAdminAssistanceRequests();

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200/90 bg-white/95 p-8 shadow-[0_8px_32px_rgba(15,23,42,0.08)]">
      {/* Bandeau d'identité + actions globales (export CSV des demandes d'assistance) */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            <HeartHandshake className="size-3.5" />
            AGAPE Assistance
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Tableau de bord d&apos;encadrement</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">
            Les urgences vitales sont priorisées en tête de liste. Les notes internes et les changements de statut sont
            visibles uniquement par l&apos;équipe d&apos;encadrement <strong>AGAPE</strong>.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <AdminAssistanceExportCsvButton rows={requests} />
        </div>
      </div>

      {/* Rappel visuel : priorisation des urgences vitales (règle métier) */}
      <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="size-4" />
          Priorité absolue
        </div>
        <p className="mt-1 max-w-xs leading-6">Les demandes de type urgence vitale doivent être traitées en premier.</p>
      </div>

      {/* Liste des dossiers : une carte par demande */}
      {requests.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
          Aucune requête d&apos;accompagnement ni de prière pour le moment.
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => {
            const category = request.category ?? request.assistance_type;
            const isUrgent = category === "urgence_vitale";
            const contact = (request.phone_contact ?? request.contact)?.trim() || null;

            return (
              <article
                key={request.id}
                className={`rounded-[28px] border p-5 shadow-sm ${
                  isUrgent
                    ? "border-red-400/80 bg-gradient-to-br from-red-50 to-rose-50 shadow-[0_0_0_1px_rgba(239,68,68,0.18)]"
                    : "border-slate-200 bg-slate-50/80"
                }`}
              >
                {/* Ligne d'en-tête de carte : badges catégorie / statut */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isUrgent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                          <AlertTriangle className="size-3.5" />
                          Urgence vitale
                        </span>
                      ) : (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                          {formatCategory(category)}
                        </span>
                      )}
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                        {formatStatus(request.assistance_status)}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{formatMemberName(request)}</h2>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatDate(request.created_at)}</p>
                    </div>
                  </div>

                  {/* Bloc contact : actions client (copie / appel / mail selon le type détecté) */}
                  <div className="min-w-[220px] rounded-[22px] border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Contact prioritaire</p>
                    <AdminContactReachActions contact={contact} />
                  </div>
                </div>

                {/* Corps : message utilisateur + formulaire de mise à jour (Server Action + useActionState dans l'enfant) */}
                <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
                  <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Message de détresse</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{request.message}</p>
                  </div>

                  <AdminAssistanceRequestForm
                    request={{
                      id: request.id,
                      assistance_status: request.assistance_status,
                      internal_notes: request.internal_notes,
                    }}
                    locale={locale}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
