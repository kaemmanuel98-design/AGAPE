import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { BibleVerseBody } from "@/components/bible-strong/bible-verse-body";
import { bibleBookPath, bibleChapterPath, bibleVersePath, bibleVersionPath } from "@/lib/bible/paths";
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

  const prevChapter = chapter > 1 ? chapter - 1 : null;
  const nextChapter = chapter < bookMeta.max_chapter ? chapter + 1 : null;

  return (
    <article className="mx-auto max-w-3xl space-y-8 pb-16 font-[family-name:var(--font-bible-study-serif),ui-serif,Georgia,serif]">
      <nav className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <NextLink href={bibleBookPath(version.slug, bookCode)} className="font-medium text-sky-800 hover:underline">
          ← {bookMeta.book_title}
        </NextLink>
        <NextLink href={bibleVersionPath(version.slug)} className="text-slate-600 hover:text-slate-900">
          {version.title}
        </NextLink>
      </nav>

      <header className="border-b border-amber-900/10 pb-6">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {bookMeta.book_title} {chapter}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("strongHint")}</p>
      </header>

      {verses.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-10 text-center text-sm text-slate-600">
          {t("noVersesInChapter")}
        </p>
      ) : (
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-8 shadow-sm md:px-8">
          {verses.map((v) => (
            <div key={v.id} id={`v${v.verse}`} className="group scroll-mt-24">
              <div className="flex gap-3">
                <span className="mt-1 shrink-0 text-sm font-bold tabular-nums text-amber-900/70">{v.verse}</span>
                <div className="min-w-0 flex-1">
                  <BibleVerseBody
                    text={v.body_text}
                    className="text-[1.05rem] leading-[1.8] text-slate-900 md:text-[1.12rem] md:leading-[1.85]"
                  />
                  <NextLink
                    href={bibleVersePath(v.id)}
                    className="mt-2 inline-block text-xs font-medium text-sky-800 opacity-0 transition group-hover:opacity-100 hover:underline"
                  >
                    {t("studyVerse")} →
                  </NextLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <nav className="flex justify-between gap-4 border-t border-amber-900/10 pt-6 text-sm font-medium">
        {prevChapter ? (
          <NextLink
            href={bibleChapterPath(version.slug, bookCode, prevChapter)}
            className="text-sky-800 hover:underline"
          >
            ← {t("prevChapter")}
          </NextLink>
        ) : (
          <span />
        )}
        {nextChapter ? (
          <NextLink
            href={bibleChapterPath(version.slug, bookCode, nextChapter)}
            className="text-sky-800 hover:underline"
          >
            {t("nextChapter")} →
          </NextLink>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
