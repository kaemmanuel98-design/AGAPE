import { cookies } from "next/headers";

import { routing, type AppLocale } from "@/i18n/routing";

/** Locale pour les piliers hub sans préfixe `/fr|en|nl` (Bible, Academy, etc.). */
export async function resolvePublicHubLocale(): Promise<AppLocale> {
  const requested = (await cookies()).get("NEXT_LOCALE")?.value;
  if (requested && (routing.locales as readonly string[]).includes(requested)) {
    return requested as AppLocale;
  }
  return routing.defaultLocale;
}
