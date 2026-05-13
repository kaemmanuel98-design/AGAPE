"use client";

import { useActionState } from "react";

import { type AssistanceUpdateState, updateAssistanceRequest } from "@/app/actions";
import type { AdminAssistanceRequestRow } from "@/lib/prayer/types";

function feedbackMessage(state: AssistanceUpdateState): string | null {
  if (!state || state.ok) return null;
  switch (state.message) {
    case "invalid_fields":
      return "Champs invalides. Vérifie le statut sélectionné.";
    case "unauthorized":
      return "Session expirée. Reconnecte-toi.";
    case "forbidden":
      return "Accès refusé.";
    case "unexpected_error":
      return "Erreur inattendue. Réessaie dans un instant.";
    default:
      return state.message;
  }
}

type Props = {
  request: Pick<AdminAssistanceRequestRow, "id" | "assistance_status" | "internal_notes">;
  locale: string;
};

export function AdminAssistanceRequestForm({ request, locale }: Props) {
  /**
   * `useActionState` fournit `formAction` : c’est lui qui doit être passé à `<form action={…}>`.
   * La Server Action reçoit toujours `(prevState, formData)` — voir `app/actions.ts`.
   */
  const [state, formAction, isPending] = useActionState(updateAssistanceRequest, null);

  const errorText = state?.ok === false ? feedbackMessage(state) : null;

  return (
    <form action={formAction} className="grid gap-4 rounded-[24px] border border-slate-200 bg-white/90 p-4">
      <input type="hidden" name="id" value={request.id} />
      <input type="hidden" name="locale" value={locale} />

      {errorText ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{errorText}</p>
      ) : null}
      {state?.ok === true ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Mise à jour réussie.
        </p>
      ) : null}

      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Statut</span>
        <select
          name="assistance_status"
          defaultValue={request.assistance_status}
          disabled={isPending}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-sky-300/40 focus:ring-2 disabled:opacity-60"
        >
          <option value="en_attente">En attente</option>
          <option value="en_cours">En cours</option>
          <option value="accompagne">Accompagne</option>
        </select>
      </label>

      <label className="grid gap-2">
        {/* Champ `internal_notes` côté base : suivi confidentiel réservé aux super-admins AGAPE */}
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Notes de suivi</span>
        <textarea
          name="internal_notes"
          rows={5}
          defaultValue={request.internal_notes ?? ""}
          disabled={isPending}
          placeholder="Visible uniquement par les admins AGAPE..."
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-sky-300/40 focus:ring-2 disabled:opacity-60"
        />
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isPending ? "Enregistrement…" : "Changer le statut"}
        </button>
      </div>
    </form>
  );
}
