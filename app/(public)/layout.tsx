import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { BackgroundByRoute } from "@/components/background-by-route";
import { GlassSpaceNav } from "@/components/glass-space-nav";
import { SpaceTransition } from "@/components/space-transition";
import { routing } from "@/i18n/routing";

type Props = { children: ReactNode };

/**
 * Coque pour les routes courtes sans préfixe de langue (`/academy`, `/calendar`, etc.).
 * Ici on fixe la locale par défaut (fr) et on charge les messages pour les composants client (formulaire, nav).
 */
export default async function PublicLocalelessLayout({ children }: Props) {
  setRequestLocale(routing.defaultLocale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
      <BackgroundByRoute />
      <GlassSpaceNav />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 md:pt-32">
        <SpaceTransition>{children}</SpaceTransition>
      </main>
    </NextIntlClientProvider>
  );
}
