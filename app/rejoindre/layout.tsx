import type { ReactNode } from "react";

import { AgapeHubShell } from "@/components/hub/agape-hub-shell";

type Props = { children: ReactNode };

/**
 * Coque hub pour `/rejoindre` (même expérience que calendrier / planning sans segment `(public)`).
 */
export default function RejoindreSegmentLayout({ children }: Props) {
  return (
    <AgapeHubShell
      outerClassName="min-h-screen bg-slate-50 text-slate-900"
      mainClassName="bg-slate-50"
    >
      {children}
    </AgapeHubShell>
  );
}
