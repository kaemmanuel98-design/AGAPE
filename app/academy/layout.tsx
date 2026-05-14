import type { ReactNode } from "react";

import { AgapeHubShell } from "@/components/hub/agape-hub-shell";

type Props = { children: ReactNode };

/**
 * Pilier Academy : fond blanc, navigation latérale partagée avec les autres espaces publics.
 */
export default function AcademyLayout({ children }: Props) {
  return (
    <AgapeHubShell outerClassName="min-h-screen bg-white text-slate-900" mainClassName="bg-white">
      {children}
    </AgapeHubShell>
  );
}
