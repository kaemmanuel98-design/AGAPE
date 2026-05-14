import type { Metadata } from "next";

import { BibleStrongIndexView } from "@/components/bible-strong/bible-strong-index-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bible Strong — AGAPE",
  description: "Lecture biblique et numéros Strong — texte issu de Supabase.",
};

type Props = {
  searchParams: Promise<{ version?: string }>;
};

/** Index des versions et versets — données `bible_versions` / `bible_verses`. */
export default async function BibleStrongRootPage({ searchParams }: Props) {
  const sp = await searchParams;
  return <BibleStrongIndexView selectedVersionId={sp.version ?? null} />;
}
