"use client";

import { useActionState } from "react";
import { Archive, Loader2 } from "lucide-react";

import {
  archiveMemberRegistration,
  type MemberRegistrationAdminState,
  updateMemberAdminNotes,
} from "@/lib/actions/members-registration-secret";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Extrait un message d’erreur lisible à partir de l’état renvoyé par la Server Action. */
function errorMessage(state: MemberRegistrationAdminState): string | null {
  if (!state || state.ok !== false) return null;
  switch (state.message) {
    case "forbidden":
      return "Accès refusé ou session expirée.";
    case "invalid_id":
      return "Identifiant de dossier invalide.";
    case "notes_too_long":
      return "Les notes dépassent la limite autorisée (8000 caractères).";
    default:
      return state.message;
  }
}

type NotesProps = {
  id: string;
  locale: string;
  defaultNotes: string;
  /** Classes Tailwind pour s’intégrer au thème sombre (console) ou clair (dashboard). */
  theme: "dark" | "light";
};

/**
 * Formulaire « Notes de suivi » branché sur `useActionState` + `updateMemberAdminNotes`.
 * Le `<form>` utilise obligatoirement `formAction` (et non l’action serveur brute) pour satisfaire React 19 / Vercel.
 */
export function MemberRegistrationNotesForm({ id, locale, defaultNotes, theme }: NotesProps) {
  const [state, formAction, pending] = useActionState(updateMemberAdminNotes, null);
  const err = errorMessage(state);
  const dark = theme === "dark";

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="locale" value={locale} />
      {err ? (
        <p className={cn("rounded-md border px-2 py-1.5 text-[11px]", dark ? "border-red-500/40 bg-red-950/50 text-red-100" : "border-red-200 bg-red-50 text-red-800")}>
          {err}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className={cn("rounded-md border px-2 py-1.5 text-[11px]", dark ? "border-emerald-500/40 text-emerald-100" : "border-emerald-200 bg-emerald-50 text-emerald-900")}>
          Notes enregistrées.
        </p>
      ) : null}
      <label className={cn("text-[10px] font-semibold uppercase tracking-wide", dark ? "text-zinc-500" : "text-slate-500")}>
        Notes de suivi
      </label>
      <textarea
        name="admin_notes"
        rows={3}
        defaultValue={defaultNotes}
        disabled={pending}
        placeholder="Interventions, rappels, suivi…"
        className={cn(
          "w-full resize-y rounded-lg border px-2.5 py-2 text-xs outline-none focus:ring-2 disabled:opacity-60",
          dark
            ? "border-zinc-700 bg-zinc-900 text-zinc-100 ring-sky-500/30 placeholder:text-zinc-600"
            : "border-slate-200 bg-white text-slate-900 ring-sky-300/40",
        )}
      />
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        disabled={pending}
        className={cn("w-fit rounded-lg text-xs", dark && "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700")}
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
        Enregistrer les notes
      </Button>
    </form>
  );
}

type ArchiveProps = {
  id: string;
  locale: string;
  theme: "dark" | "light";
};

/**
 * Archivage d’un dossier membre : `useActionState` + `archiveMemberRegistration` pour le même motif technique.
 */
export function MemberRegistrationArchiveForm({ id, locale, theme }: ArchiveProps) {
  const [state, formAction, pending] = useActionState(archiveMemberRegistration, null);
  const err = errorMessage(state);
  const dark = theme === "dark";

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="locale" value={locale} />
      {err ? (
        <p className={cn("max-w-[14rem] rounded-md border px-2 py-1.5 text-right text-[11px]", dark ? "border-red-500/40 text-red-100" : "border-red-200 text-red-800")}>
          {err}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className={cn("text-[11px]", dark ? "text-emerald-200" : "text-emerald-800")}>Dossier archivé.</p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        variant="outline"
        className={cn(
          "gap-2 rounded-lg text-xs font-semibold",
          dark ? "border-zinc-600 bg-zinc-800/80 text-zinc-200 hover:bg-zinc-800" : "border-slate-300",
        )}
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Archive className="size-3.5 shrink-0" aria-hidden />}
        Archiver
      </Button>
    </form>
  );
}
