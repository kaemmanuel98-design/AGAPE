"use client";

import { Copy, Mail, Phone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { MemberPhoneActions } from "@/components/admin/MemberPhoneActions";

type Props = {
  /** Contact prioritaire : téléphone ou e-mail selon la saisie utilisateur. */
  contact: string | null;
};

function isLikelyEmail(value: string) {
  return value.includes("@");
}

/**
 * Boutons « joindre » contextuels : téléphone (appel + copie) ou e-mail (mailto + copie).
 * Réutilisable sur le module AGAPE Assistance.
 */
export function AdminContactReachActions({ contact }: Props) {
  const [copied, setCopied] = useState(false);
  const raw = contact?.trim() ?? "";

  if (!raw) {
    return <p className="mt-2 text-sm text-slate-500">Aucun contact fourni.</p>;
  }

  async function copyContact() {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (isLikelyEmail(raw)) {
    return (
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild size="sm" variant="outline" className="gap-2 rounded-xl">
          <a href={`mailto:${encodeURIComponent(raw)}`}>
            <Mail className="size-4 shrink-0" aria-hidden />
            Écrire
          </a>
        </Button>
        <Button type="button" size="sm" variant="outline" className="gap-2 rounded-xl" onClick={() => void copyContact()}>
          <Copy className="size-4 shrink-0" aria-hidden />
          {copied ? "Copié" : "Copier"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <p className="inline-flex items-center gap-2 font-medium text-slate-900">
        <Phone className="size-4 text-sky-600" aria-hidden />
        {raw}
      </p>
      <MemberPhoneActions phone={raw} variant="light" layout="row" />
    </div>
  );
}
