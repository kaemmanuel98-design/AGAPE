import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";

type Props = { children: React.ReactNode };

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

export default function RejoindreLayout({ children }: Props) {
  return children;
}
