import type { Metadata } from "next";

import { BibleStrongIndexView } from "@/components/bible-strong/bible-strong-index-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bible Strong — AGAPE",
  description: "Lecture biblique — traductions et navigation par livre et chapitre.",
};

export default function BibleStrongRootPage() {
  return <BibleStrongIndexView />;
}
