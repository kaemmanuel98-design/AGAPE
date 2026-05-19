import { getTranslations } from "next-intl/server";

import { BibleChapterView } from "@/components/bible-strong/bible-chapter-view";
import { fetchBookMeta, fetchChapterVerses } from "@/lib/bible/queries";
import type { BibleVersionRow } from "@/lib/bible/types";

type Props = {
  version: BibleVersionRow;
  bookCode: string;
  chapter: number;
};

export async function BibleChapterReader({ version, bookCode, chapter }: Props) {
  const t = await getTranslations("bibleStrong");
  const [bookMeta, verses] = await Promise.all([
    fetchBookMeta(version.id, bookCode),
    fetchChapterVerses(version.id, bookCode, chapter),
  ]);

  if (!bookMeta) {
    return (
      <div className="mx-auto max-w-xl px-6 py-14 text-center">
        <p>{t("bookNotFound")}</p>
      </div>
    );
  }

  return (
    <BibleChapterView
      versionSlug={version.slug}
      versionTitle={version.title}
      language={version.language}
      bookCode={bookCode}
      bookTitle={bookMeta.book_title}
      chapter={chapter}
      maxChapter={bookMeta.max_chapter}
      verses={verses.map((v) => ({ id: v.id, verse: v.verse, body_text: v.body_text }))}
    />
  );
}
