import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { BibleVerseBody } from "@/components/bible-strong/bible-verse-body";
import { SourcePendingNotice } from "@/components/academy/source-pending-notice";
import { fetchBibleVerseById } from "@/lib/bible/queries";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  verseId: string;
};

/**
 * Lecture d’un verset : typographie confort (serif) + numéros Strong cliquables.
 */
export async function BibleVerseStudyView({ verseId }: Props) {
  const t = await getTranslations("bibleStrong");

  if (!UUID_RE.test(verseId)) {
    return <SourcePendingNotice namespace="bibleStrong" />;
  }

  const row = await fetchBibleVerseById(verseId);
  if (!row) {
    return <SourcePendingNotice namespace="bibleStrong" />;
  }

  const versionTitle = row.bible_versions?.title ?? "—";

  return (
    <article
      className="mx-auto max-w-3xl space-y-10 pb-16 font-[family-name:var(--font-bible-study-serif),ui-serif,Georgia,serif]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-900/10 pb-6">
        <NextLink
          href="/bible-strong"
          className="text-sm font-medium text-sky-800 underline-offset-2 hover:underline"
        >
          ← {t("backToIndex")}
        </NextLink>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/80">{versionTitle}</p>
      </div>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {row.book_title} {row.chapter}:{row.verse}
        </h1>
        <p className="text-sm text-slate-500">{t("strongHint")}</p>
      </header>

      <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-8 shadow-sm md:px-8 md:py-10">
        <BibleVerseBody
          text={row.body_text}
          className="text-[1.15rem] leading-[1.85] text-slate-900 md:text-[1.25rem] md:leading-[1.9]"
        />
      </div>
    </article>
  );
}
