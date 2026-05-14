import type { ReactNode } from "react";

import { AgapeHubShell } from "@/components/hub/agape-hub-shell";

type Props = { children: ReactNode };

/**
 * Routes publiques sans préfixe de langue (`/calendar`, `/planning`, `/rejoindre`) : même coque hub que Academy / Bible.
 */
export default function PublicLocalelessLayout({ children }: Props) {
  return (
    <AgapeHubShell
      outerClassName="min-h-screen bg-slate-50 text-slate-900"
      mainClassName="bg-slate-50"
    >
      {children}
    </AgapeHubShell>
  );
}
