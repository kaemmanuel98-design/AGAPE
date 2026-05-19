import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { BibleVerseStudyClient } from "@/components/bible-strong/bible-verse-study-client";
import { SourcePendingNotice } from "@/components/academy/source-pending-notice";
import { bibleChapterPath, bibleVersionPath } from "@/lib/bible/paths";
import { fetchBibleVerseById } from "@/lib/bible/queries";
import { stripStrongFromBodyText } from "@/lib/bible/strip-strong-text";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  verseId: string;
};

export async function BibleVerseStudyView({ verseId }: Props) {
  const t = await getTranslations("bibleStrong");

  if (!UUID_RE.test(verseId)) {
    return <SourcePendingNotice namespace="bibleStrong" />;
  }

  const row = await fetchBibleVerseById(verseId);
  if (!row) {
    return <SourcePendingNotice namespace="bibleStrong" />;
  }

  const version = row.bible_versions;
  const versionTitle = version?.title ?? "—";
  const chapterHref =
    version?.slug != null
      ? bibleChapterPath(version.slug, row.book_code, row.chapter)
      : "/bible-strong";
  const plainText = stripStrongFromBodyText(row.body_text);

  return (
    <article className="mx-auto max-w-3xl space-y-10 pb-16 font-[family-name:var(--font-bible-study-serif),ui-serif,Georgia,serif]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-900/10 pb-6">
        <NextLink
          href={chapterHref}
          className="text-sm font-medium text-sky-800 underline-offset-2 hover:underline"
        >
          ← {t("backToChapter")}
        </NextLink>
        {version?.slug ? (
          <NextLink
            href={bibleVersionPath(version.slug)}
            className="text-xs font-semibold uppercase tracking-wide text-amber-800/80 hover:underline"
          >
            {versionTitle}
          </NextLink>
        ) : (
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/80">{versionTitle}</p>
        )}
      </div>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {row.book_title} {row.chapter}:{row.verse}
        </h1>
      </header>

      <BibleVerseStudyClient
        plainText={plainText}
        verse={row.verse}
        language={version?.language ?? "fr"}
        versionSlug={version?.slug ?? "lsg"}
        bookCode={row.book_code}
        bookTitle={row.book_title}
        chapter={row.chapter}
      />
    </article>
  );
}
