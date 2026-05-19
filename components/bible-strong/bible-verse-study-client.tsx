"use client";

import { BibleAudioPlayer } from "@/components/bible-strong/bible-audio-player";
import { BibleVerseBody } from "@/components/bible-strong/bible-verse-body";

type Props = {
  plainText: string;
  verse: number;
  language: string;
  versionSlug: string;
  bookCode: string;
  bookTitle: string;
  chapter: number;
};

export function BibleVerseStudyClient({
  plainText,
  verse,
  language,
  versionSlug,
  bookCode,
  bookTitle,
  chapter,
}: Props) {
  return (
    <div className="space-y-6">
      <BibleAudioPlayer
        verses={[{ verse, text: plainText }]}
        language={language}
        versionSlug={versionSlug}
        bookCode={bookCode}
        bookTitle={bookTitle}
        chapter={chapter}
      />
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-8 shadow-sm md:px-8 md:py-10">
        <BibleVerseBody
          text={plainText}
          className="text-[1.15rem] leading-[1.85] text-slate-900 md:text-[1.25rem] md:leading-[1.9]"
        />
      </div>
    </div>
  );
}
