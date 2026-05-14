import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

type Props = { children: ReactNode };

/**
 * Routes `/profile/*` sans préfixe `[locale]` : provider i18n aligné sur le hub (locale par défaut).
 */
export default async function ProfileSegmentLayout({ children }: Props) {
  setRequestLocale(routing.defaultLocale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
