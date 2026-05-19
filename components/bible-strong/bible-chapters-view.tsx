import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { bibleChapterPath, bibleVersionPath } from "@/lib/bible/paths";
import { fetchBookMeta, fetchChaptersForBook } from "@/lib/bible/queries";
import type { BibleVersionRow } from "@/lib/bible/types";

type Props = {
  version: BibleVersionRow;
  bookCode: string;
};

export async function BibleChaptersView({ version, bookCode }: Props) {
  const t = await getTranslations("bibleStrong");
  const [bookMeta, chapters] = await Promise.all([
    fetchBookMeta(version.id, bookCode),
    fetchChaptersForBook(version.id, bookCode),
  ]);

  if (!bookMeta) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-amber-200/80 bg-white/60 px-6 py-14 text-center text-slate-800">
        <p className="text-lg font-semibold">{t("bookNotFound")}</p>
        <NextLink href={bibleVersionPath(version.slug)} className="mt-4 inline-block text-sky-800 hover:underline">
          ← {t("backToBooks")}
        </NextLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <NextLink href={bibleVersionPath(version.slug)} className="text-sm font-medium text-sky-800 hover:underline">
        ← {t("backToBooks")}
      </NextLink>

      <header className="space-y-1 border-b border-amber-900/10 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/80">{version.title}</p>
        <h1 className="font-[family-name:var(--font-bible-study-serif),ui-serif,Georgia,serif] text-3xl font-bold text-slate-900">
          {bookMeta.book_title}
        </h1>
        <p className="text-sm text-slate-600">{t("chaptersHeading")}</p>
      </header>

      {chapters.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-10 text-center text-sm text-slate-600">
          {t("noChaptersInBook")}
        </p>
      ) : (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {chapters.map((ch) => (
            <li key={ch.chapter}>
              <NextLink
                href={bibleChapterPath(version.slug, bookCode, ch.chapter)}
                className="flex aspect-square items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-sm font-semibold text-slate-800 shadow-sm hover:border-amber-400/80 hover:bg-amber-50/60"
              >
                {ch.chapter}
              </NextLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}