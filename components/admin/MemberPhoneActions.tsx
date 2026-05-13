"use client";

import { Copy, Phone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  phone: string;
  /** Présentation : console sombre ou cartes claires. */
  variant?: "dark" | "light";
  layout?: "row" | "column";
};

/**
 * Normalise le numéro pour le schéma `tel:` (chiffres et + conservés).
 */
function telHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : undefined;
}

/**
 * Actions rapides par ligne : ouvrir le composeur téléphonique ou copier le numéro dans le presse-papiers.
 * Composant client (API Clipboard indisponible côté serveur).
 */
export function MemberPhoneActions({ phone, variant = "light", layout = "column" }: Props) {
  const [copied, setCopied] = useState(false);
  const href = telHref(phone);
  const dark = variant === "dark";

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("flex gap-2", layout === "column" ? "flex-col items-stretch sm:items-end" : "flex-row flex-wrap")}>
      {href ? (
        <Button asChild size="sm" variant="outline" className={cn("gap-2", dark && "border-sky-600/50 bg-sky-600/15 text-sky-100 hover:bg-sky-600/25")}>
          <a href={href}>
            <Phone className="size-3.5 shrink-0" aria-hidden />
            Appeler
          </a>
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => void copyNumber()}
        className={cn("gap-2", dark && "border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700")}
      >
        <Copy className="size-3.5 shrink-0" aria-hidden />
        {copied ? "Copié" : "Copier le numéro"}
      </Button>
    </div>
  );
}
