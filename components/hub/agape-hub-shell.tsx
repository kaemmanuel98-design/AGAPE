import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { AgapeHubSidebar } from "@/components/hub/agape-hub-sidebar";
import { SpaceTransition } from "@/components/space-transition";
import { routing } from "@/i18n/routing";
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
 */
export async function AgapeHubShell({ children, outerClassName, mainClassName }: Props) {
  setRequestLocale(routing.defaultLocale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
      <div className={cn("flex min-h-screen flex-col md:flex-row", outerClassName)}>
        <AgapeHubSidebar />
        <main className={cn("flex-1 min-w-0 px-4 pb-14 pt-4 md:px-10 md:pb-16 md:pt-10", mainClassName)}>
          <SpaceTransition>{children}</SpaceTransition>
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
