import { HeartHandshake, LockKeyhole } from "lucide-react";

import { getCurrentProfile } from "@/lib/profile/queries";
import { listPrayerRequests } from "@/lib/prayer/queries";

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

function formatNeedType(value: string | null) {
  switch (value) {
    case "urgence":
      return "Urgence / Detresse";
    case "maladie":
      return "Maladie";
    case "deuil":
      return "Deuil";
    case "accompagnement":
      return "Accompagnement";
    default:
      return null;
  }
}

export async function AdminPrayers() {
  const { profile } = await getCurrentProfile();

  if (!profile || profile.role !== "super-admin") {
    return (
      <section className="rounded-[28px] border border-amber-200 bg-amber-50/90 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <LockKeyhole className="size-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-amber-900">Demandes de prieres</h2>
            <p className="text-sm leading-6 text-amber-800">
              Cette vue est reservee aux utilisateurs ayant le role super-admin.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const requests = await listPrayerRequests();

  return (
    <section className="space-y-5 rounded-[28px] border border-slate-200/90 bg-white/95 p-8 shadow-[0_2px_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <HeartHandshake className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Demandes de prieres</h2>
          <p className="text-sm text-slate-600">
            Messages envoyes depuis le formulaire de priere et du confessionnal.
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
          Aucune demande pour le moment.
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li
              key={request.id}
              className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {request.is_anonymous ? "Anonyme" : request.sender_name || "Sans nom"}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {formatDate(request.created_at)}
                  </p>
                  {request.requester_user_id ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Utilisateur lie : <span className="font-mono">{request.requester_user_id}</span>
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {request.is_anonymous ? (
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                      Anonyme
                    </span>
                  ) : null}
                  {formatNeedType(request.assistance_type) ? (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                      {formatNeedType(request.assistance_type)}
                    </span>
                  ) : null}
                  {request.source === "assistance" ? (
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                      AGAPE Assistance
                    </span>
                  ) : null}
                </div>
              </div>
              {request.contact ? (
                <p className="mt-4 text-sm font-medium text-slate-700">
                  Contact : <span className="text-slate-600">{request.contact}</span>
                </p>
              ) : null}
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {request.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
