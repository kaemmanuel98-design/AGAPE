import { AlertTriangle, HeartHandshake, Mail, Phone, ShieldAlert } from "lucide-react";

import { updateAssistanceRequest } from "@/lib/actions/admin-assistance";
import { listAdminAssistanceRequests } from "@/lib/prayer/queries";

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

function contactKind(value: string | null) {
  if (!value) return null;
  return value.includes("@") ? "email" : "phone";
}

export async function AdminAssistance({ locale }: { locale: string }) {
  const requests = await listAdminAssistanceRequests();

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200/90 bg-white/95 p-8 shadow-[0_8px_32px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            <HeartHandshake className="size-3.5" />
            AGAPE Assistance
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Tableau de bord d&apos;encadrement
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">
            Les urgences vitales sont priorisées en tête de liste. Les notes internes et les
            changements de statut sont visibles uniquement par l&apos;équipe d&apos;encadrement AGAPE.
          </p>
        </div>
        <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="size-4" />
            Priorité absolue
          </div>
          <p className="mt-1 max-w-xs leading-6">
            Les demandes de type urgence vitale doivent être traitées en premier.
          </p>
        </div>
      </div>

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
            const kind = contactKind(contact);

            return (
              <article
                key={request.id}
                className={`rounded-[28px] border p-5 shadow-sm ${
                  isUrgent
                    ? "animate-pulse border-red-300 bg-gradient-to-br from-red-50 to-rose-50 shadow-[0_0_0_1px_rgba(239,68,68,0.12),0_18px_40px_rgba(239,68,68,0.14)]"
                    : "border-slate-200 bg-slate-50/80"
                }`}
              >
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
                      <h2 className="text-lg font-semibold text-slate-900">
                        {formatMemberName(request)}
                      </h2>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-[220px] rounded-[22px] border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Contact prioritaire
                    </p>
                    {contact ? (
                      <p className="mt-2 inline-flex items-center gap-2 font-medium text-slate-900">
                        {kind === "email" ? <Mail className="size-4 text-sky-600" /> : <Phone className="size-4 text-sky-600" />}
                        {contact}
                      </p>
                    ) : (
                      <p className="mt-2 text-slate-500">Aucun contact fourni.</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
                  <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Message de détresse
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {request.message}
                    </p>
                  </div>

                  <form action={updateAssistanceRequest} className="grid gap-4 rounded-[24px] border border-slate-200 bg-white/90 p-4">
                    <input type="hidden" name="id" value={request.id} />
                    <input type="hidden" name="locale" value={locale} />

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Statut
                      </span>
                      <select
                        name="assistance_status"
                        defaultValue={request.assistance_status}
                        className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-sky-300/40 focus:ring-2"
                      >
                        <option value="en_attente">En attente</option>
                        <option value="en_cours">En cours</option>
                        <option value="accompagne">Accompagne</option>
                      </select>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Notes internes
                      </span>
                      <textarea
                        name="internal_notes"
                        rows={5}
                        defaultValue={request.internal_notes ?? ""}
                        placeholder="Visible uniquement par les admins AGAPE..."
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-sky-300/40 focus:ring-2"
                      />
                    </label>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        Changer le statut
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
