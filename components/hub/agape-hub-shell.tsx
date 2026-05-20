import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { AgapeHubSidebar } from "@/components/hub/agape-hub-sidebar";
import { HubBirthdayNotifications } from "@/components/notifications/hub-birthday-notifications";
import { SpaceTransition } from "@/components/space-transition";
import { resolvePublicHubLocale } from "@/lib/navigation/resolve-public-hub-locale";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Classes sur le conteneur flex racine (fond global du pilier). */
  outerClassName: string;
  /** Classes additionnelles sur la zone `main` (scroll du contenu). */
  mainClassName?: string;
};

/**
 * Coque partagée des routes « hub » sans préfixe de langue : provider i18n + barre latérale + contenu.
 * La langue suit le cookie `NEXT_LOCALE` (sélecteur FR / EN / NL dans la barre latérale).
 */
export async function AgapeHubShell({ children, outerClassName, mainClassName }: Props) {
  const locale = await resolvePublicHubLocale();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className={cn("flex min-h-screen flex-col md:flex-row", outerClassName)}>
        <AgapeHubSidebar />
        <main className={cn("flex-1 min-w-0 px-4 pb-14 pt-4 md:px-10 md:pb-16 md:pt-10", mainClassName)}>
          <HubBirthdayNotifications />
          <SpaceTransition>{children}</SpaceTransition>
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
