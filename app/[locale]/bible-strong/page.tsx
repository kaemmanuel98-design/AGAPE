import type { Metadata } from "next";

import { BibleStrongReader } from "@/components/bible-strong/bible-strong-reader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bible Strong — AGAPE",
  description: "Lecture et ressources Bible Strong pour la communauté AGAPE.",
};

export default async function BibleStrongPage() {
  /* Page publique : aucune authentification requise (portail ouvert AGAPE). */
  return <BibleStrongReader />;
}
