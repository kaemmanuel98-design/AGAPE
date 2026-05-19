import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BibleBooksView } from "@/components/bible-strong/bible-books-view";
import { fetchBibleVersionBySlug } from "@/lib/bible/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ versionSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { versionSlug } = await params;
  const version = await fetchBibleVersionBySlug(versionSlug);
  return {
    title: version ? `${version.title} — Bible Strong` : "Bible Strong",
  };
}

export default async function BibleVersionPage({ params }: Props) {
  const { versionSlug } = await params;
  const version = await fetchBibleVersionBySlug(versionSlug);
  if (!version) notFound();
  return <BibleBooksView version={version} />;
}
