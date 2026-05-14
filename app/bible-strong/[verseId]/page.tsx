import type { Metadata } from "next";

import { BibleVerseStudyView } from "@/components/bible-strong/bible-verse-study-view";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ verseId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { verseId } = await params;
  return { title: `Verset · Bible Strong · ${verseId.slice(0, 8)}…` };
}

/** Étude d’un verset précis — ligne `bible_verses` identifiée par son UUID. */
export default async function BibleVersePage({ params }: Props) {
  const { verseId } = await params;
  return <BibleVerseStudyView verseId={verseId} />;
}
