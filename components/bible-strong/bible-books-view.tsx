import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { BibleStrongHeader } from "@/components/bible-strong/bible-strong-header";
import { BibleVersionPicker } from "@/components/bible-strong/bible-version-picker";
import { bibleBookPath } from "@/lib/bible/paths";
import { fetchBooksForVersion, fetchBibleVersions } from "@/lib/bible/queries";
import type { BibleVersionRow } from "@/lib/bible/types";

type Props = {
  version: BibleVersionRow;
};

export async function BibleBooksView({ version }: Props) {
  const t = await getTranslations("bibleStrong");
  const [versions, books] = await Promise.all([
    fetchBibleVersions(),
    fetchBooksForVersion(version.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-8">
      <NextLink href="/bible-strong" className="text-sm font-medium text-sky-800 hover:underline">
        ← {t("backToIndex")}
      </NextLink>

      <BibleStrongHeader versionTitle={version.title} />
      <BibleVersionPicker versions={versions} activeSlug={version.slug} />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t("booksHeading")}</h2>
        {books.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-10 text-center text-sm text-slate-600">
            {t("noVersesInVersion")}
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {books.map((book) => (
              <li key={book.book_code}>
                <NextLink
                  href={bibleBookPath(version.slug, book.book_code)}
                  className="block rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm shadow-sm hover:border-amber-300/70 hover:bg-amber-50/50"
                >
                  <span className="font-semibold text-slate-900">{book.book_title}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {t("chaptersCount", { count: book.max_chapter })}
                  </span>
                </NextLink>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
