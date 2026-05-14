import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";

import { RejoindreFormClient } from "./rejoindre-form-client";

/**
 * Métadonnées pour la route `/rejoindre` (sans segment `[locale]` dans l’URL).
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: routing.defaultLocale, namespace: "memberRegistration" });
  return {
    title: `${t("title")} · AGAPE`,
    description: t("subtitle"),
  };
}

/** Formulaire d’inscription — logique dans le composant client (Server Action + état). */
export default function RejoindrePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16 pt-6">
      <RejoindreFormClient />
    </div>
  );
}
