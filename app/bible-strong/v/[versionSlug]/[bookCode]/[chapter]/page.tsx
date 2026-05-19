import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BibleChapterReader } from "@/components/bible-strong/bible-chapter-reader";
import { fetchBibleVersionBySlug, fetchBookMeta } from "@/lib/bible/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ versionSlug: string; bookCode: string; chapter: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { versionSlug, bookCode, chapter } = await params;
  const version = await fetchBibleVersionBySlug(versionSlug);
  if (!version) return { title: "Bible Strong" };
  const book = await fetchBookMeta(version.id, bookCode);
  const ch = Number(chapter);
  if (!book || !Number.isFinite(ch)) return { title: "Bible Strong" };
  return { title: `${book.book_title} ${ch} — ${version.title}` };
}

export default async function BibleChapterPage({ params }: Props) {
  const { versionSlug, bookCode, chapter: chapterParam } = await params;
  const chapter = Number(chapterParam);
  if (!Number.isFinite(chapter) || chapter < 1) notFound();

  const version = await fetchBibleVersionBySlug(versionSlug);
  if (!version) notFound();

  return (
    <BibleChapterReader version={version} bookCode={bookCode.toLowerCase()} chapter={Math.floor(chapter)} />
  );
}
