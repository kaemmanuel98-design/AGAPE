"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";

import { BibleAudioPlayer } from "@/components/bible-strong/bible-audio-player";
import { BibleVerseBody } from "@/components/bible-strong/bible-verse-body";
import { bibleBookPath, bibleChapterPath, bibleVersePath, bibleVersionPath } from "@/lib/bible/paths";
import { stripStrongFromBodyText } from "@/lib/bible/strip-strong-text";
import { cn } from "@/lib/utils";

export type ChapterVerse = {
  id: string;
  verse: number;
  body_text: string;
};

type Props = {
  versionSlug: string;
  versionTitle: string;
  language: string;
  bookCode: string;
  bookTitle: string;
  chapter: number;
  maxChapter: number;
  verses: ChapterVerse[];
};

export function BibleChapterView({
  versionSlug,
  versionTitle,
  language,
  bookCode,
  bookTitle,
  chapter,
  maxChapter,
  verses,
}: Props) {
  const t = useTranslations("bibleStrong");
  const [activeVerse, setActiveVerse] = useState<number | null>(null);

  const plainVerses = useMemo(
    () =>
      verses.map((v) => ({
        id: v.id,
        verse: v.verse,
        plain: stripStrongFromBodyText(v.body_text),
      })),
    [verses],
  );

  const audioVerses = useMemo(
    () => plainVerses.map((v) => ({ verse: v.verse, text: v.plain })),
    [plainVerses],
  );

  const prevChapter = chapter > 1 ? chapter - 1 : null;
  const nextChapter = chapter < maxChapter ? chapter + 1 : null;

  return (
    <article className="mx-auto max-w-3xl space-y-8 pb-16 font-[family-name:var(--font-bible-study-serif),ui-serif,Georgia,serif]">
      <nav className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <NextLink href={bibleBookPath(versionSlug, bookCode)} className="font-medium text-sky-800 hover:underline">
          ← {bookTitle}
        </NextLink>
        <NextLink href={bibleVersionPath(versionSlug)} className="text-slate-600 hover:text-slate-900">
          {versionTitle}
        </NextLink>
      </nav>

      <header className="border-b border-amber-900/10 pb-6">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {bookTitle} {chapter}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("audioIntro")}</p>
      </header>

      <BibleAudioPlayer
        verses={audioVerses}
        language={language}
        versionSlug={versionSlug}
        bookCode={bookCode}
        bookTitle={bookTitle}
        chapter={chapter}
        onVerseActive={setActiveVerse}
      />

      {verses.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-10 text-center text-sm text-slate-600">
          {t("noVersesInChapter")}
        </p>
      ) : (
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-8 shadow-sm md:px-8">
          {plainVerses.map((v) => (
            <div
              key={v.id}
              id={`v${v.verse}`}
              className={cn(
                "group scroll-mt-24 rounded-lg transition-colors",
                activeVerse === v.verse && "bg-amber-100/60 ring-1 ring-amber-300/60",
              )}
            >
              <div className="flex gap-3 px-1 py-1">
                <span className="mt-1 shrink-0 text-sm font-bold tabular-nums text-amber-900/70">{v.verse}</span>
                <div className="min-w-0 flex-1">
                  <BibleVerseBody
                    text={v.plain}
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
            href={bibleChapterPath(versionSlug, bookCode, prevChapter)}
            className="text-sky-800 hover:underline"
          >
            ← {t("prevChapter")}
          </NextLink>
        ) : (
          <span />
        )}
        {nextChapter ? (
          <NextLink
            href={bibleChapterPath(versionSlug, bookCode, nextChapter)}
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
