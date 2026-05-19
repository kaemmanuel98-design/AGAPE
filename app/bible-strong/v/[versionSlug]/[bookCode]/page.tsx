import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BibleChaptersView } from "@/components/bible-strong/bible-chapters-view";
import { fetchBibleVersionBySlug, fetchBookMeta } from "@/lib/bible/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ versionSlug: string; bookCode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { versionSlug, bookCode } = await params;
  const version = await fetchBibleVersionBySlug(versionSlug);
  if (!version) return { title: "Bible Strong" };
  const book = await fetchBookMeta(version.id, bookCode);
  return {
    title: book ? `${book.book_title} — ${version.title}` : "Bible Strong",
  };
}

export default async function BibleBookPage({ params }: Props) {
  const { versionSlug, bookCode } = await params;
  const version = await fetchBibleVersionBySlug(versionSlug);
  if (!version) notFound();
  return <BibleChaptersView version={version} bookCode={bookCode.toLowerCase()} />;
}
