import type { ReactNode } from "react";
import { Merriweather } from "next/font/google";

import { AgapeHubShell } from "@/components/hub/agape-hub-shell";

const bibleReading = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bible-study-serif",
});

type Props = { children: ReactNode };

/**
 * Pilier Bible Strong : fond crème (#FDFBF7), typo serif via variable CSS pour le texte scripturaire.
 */
export default function BibleStrongLayout({ children }: Props) {
  return (
    <div className={bibleReading.variable}>
      <AgapeHubShell
        outerClassName="min-h-screen bg-[#FDFBF7] text-slate-900"
        mainClassName="bg-[#FDFBF7]"
      >
        {children}
      </AgapeHubShell>
    </div>
  );
}
